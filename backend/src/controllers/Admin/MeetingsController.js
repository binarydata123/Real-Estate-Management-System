import { Meetings } from "../../models/Agent/MeetingModel.js";
//import { Agency } from "../../models/Agent/AgencyModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Get all meetings
export const getMeetings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, agencyId } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const matchQuery = {};

    if (agencyId) {
      matchQuery.agencyId = agencyId;
    }

    if (status) {
      matchQuery.status = { $regex: status, $options: "i" };
    }

    // ✅ NEW: Get total unfiltered count (only agencyId filter)

    const totalUnfilteredQuery = agencyId ? { agencyId } : {};
    const totalUnfiltered = await Meetings.countDocuments(totalUnfilteredQuery);


    // ✅ NEW: Get scheduled + rescheduled count
    const scheduledQuery = agencyId 
      ? { agencyId, status: { $in: ["scheduled", "rescheduled"] } }
      : { status: { $in: ["scheduled", "rescheduled"] } };
      
    const scheduledCount = await Meetings.countDocuments(scheduledQuery);


    const pipeline = [
      { $match: matchQuery },

      // Agency
      {
        $lookup: {
          from: "agencies",
          localField: "agencyId",
          foreignField: "_id",
          as: "agencyData",
        },
      },
      { $unwind: { path: "$agencyData", preserveNullAndEmptyArrays: true } },

      // Property
      {
        $lookup: {
          from: "properties",
          localField: "propertyId",
          foreignField: "_id",
          as: "propertyData",
        },
      },
      { $unwind: { path: "$propertyData", preserveNullAndEmptyArrays: true } },

      // Customer
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
        },
      },
      { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
    ];

    // 🔍 Search Logic (supports all 4 columns)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "customerData.fullName": { $regex: search, $options: "i" } }, // Customer Name
            { "propertyData.title": { $regex: search, $options: "i" } }, // Property Name
            { "agencyData.name": { $regex: search, $options: "i" } }, // Agency Name
          ],
        },
      });
    }

    const total = await Meetings.aggregate([...pipeline, { $count: "count" }]);
    const totalCount = total[0]?.count || 0;

    pipeline.push({ $sort: { _id: -1 } });
    pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
    pipeline.push({ $limit: limitNumber });

    const results = await Meetings.aggregate(pipeline);

    return res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount, // Filtered count (changes with search/status)
        totalUnfiltered: totalUnfiltered, // ✅ NEW: Always shows all meetings
        scheduledCount: scheduledCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update a meeting
export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedMeeting = await Meetings.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMeeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meetings not found" });
    }
    await createNotification({
      userId: updatedMeeting.owner,
      message: `Meeting (${updatedMeeting.name}) has been updated successfully.`,
      type: "lead_updated",
    });
      await sendPushNotification({
        userId: updatedMeeting.owner,
        title: "Meeting Updated",
        message: `Meeting (${updatedMeeting.name}) has been updated successfully.`,
        urlPath: "Meeting",
      });
    return res.json({ success: true, data: updatedMeeting });
  } catch (error) {
    console.error("Error updating meeting:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a meeting
export const deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const deletedMeeting = await Meetings.findByIdAndDelete(meetingId);
    if (!deletedMeeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meetings not found" });
    }
    await Meetings.deleteOne({ _id: deletedMeeting._id });

    return res.json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
