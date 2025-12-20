import { PropertyShare } from "../../models/Agent/PropertyShareModel.js";
//import { Agency } from "../../models/Agent/AgencyModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";
import { PreferenceFeedbacks } from "../../models/Agent/PreferenceFeedbackModel.js";
import { Property } from "../../models/Agent/PropertyModel.js";

// Get all shared Properties
export const getSharedProperties = async (req, res) => {
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


    //Getting the total property shared

    const baseMatch = agencyId ? { agencyId }: {};
    const totalWithoutFilter = await PropertyShare.countDocuments(baseMatch);

    // Base aggregation
    const pipeline = [
      { $match: matchQuery },

      // Agency
      {
        $lookup: {
          from: "agencies",
          localField: "agencyId",
          foreignField: "_id",
          as: "agencyData"
        }
      },
      { $unwind: { path: "$agencyData", preserveNullAndEmptyArrays: true } },

      // Property
      {
        $lookup: {
          from: "properties",
          localField: "propertyId",
          foreignField: "_id",
          as: "propertyData"
        }
      },
      { $unwind: { path: "$propertyData", preserveNullAndEmptyArrays: true } },

      // Shared With Customer
      {
        $lookup: {
          from: "customers",
          localField: "sharedWithUserId",
          foreignField: "_id",
          as: "customerData"
        }
      },
      { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },

      // Shared By User
      {
        $lookup: {
          from: "users",
          localField: "sharedByUserId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
    ];


    // 🔍 Search Logic (supports all 4 columns)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "userData.name": { $regex: search, $options: "i" } }, // Shared By User
            { "customerData.fullName": { $regex: search, $options: "i" } }, // Shared With Customer
            { "propertyData.title": { $regex: search, $options: "i" } }, // Property Name
            { "agencyData.name": { $regex: search, $options: "i" } }, // Agency Name
          ]
        }
      });
    }

    // Pagination
    const total = await PropertyShare.aggregate([...pipeline, { $count: "count" }]);
    const totalCount = total[0]?.count || 0;

    pipeline.push({ $sort: { _id: -1 } });
    pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
    pipeline.push({ $limit: limitNumber });

    const results = await PropertyShare.aggregate(pipeline);

    const totalCountForStats = await PropertyShare.countDocuments({});
    const totalProperties = await Property.countDocuments();

    return res.json({
      success: true,
      data: results,
      pagination: {
        total: totalCount,
        totalWithoutFilter:totalWithoutFilter,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
      stats: {
        totalCountForStats,
        totalProperties: totalProperties,
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Update a Share Properties
export const updateSharedProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedShareProperty = await PropertyShare.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedShareProperty) {
      return res
        .status(404)
        .json({ success: false, message: "Property share not found" });
    }
    await createNotification({
      userId: updatedShareProperty.owner,
      message: `Property share (${updatedShareProperty.name}) has been updated successfully.`,
      type: "lead_updated",
    });
    await sendPushNotification({
      userId: updatedShareProperty.owner,
      title: "Property share Updated",
      message: `Property share (${updatedShareProperty.name}) has been updated successfully.`,
      urlPath: "Property Share",
    });
    return res.json({ success: true, data: updatedShareProperty });
  } catch (error) {
    console.error("Error updating property share:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a meeting
export const deleteSharedProperty = async (req, res) => {
  try {
    const sharedPropertyId = req.params.id;

    // 1. Fetch property share with property details
    const sharedProperty = await PropertyShare.findById(sharedPropertyId)
      .populate("propertyId", "title name");

    if (!sharedProperty) {
      return res.status(404).json({
        success: false,
        message: "Property Share not found",
      });
    }

    const propertyName =
      sharedProperty.propertyId?.title ||
      sharedProperty.propertyId?.name ||
      "Property";

    const sharedBy = sharedProperty.sharedByUserId;
    const sharedWith = sharedProperty.sharedWithUserId;

    // 2. Delete
    await PropertyShare.deleteOne({ _id: sharedProperty._id });

    // Detect if Admin deleted
    const deletedByAdmin = req.user?.role === "admin";

    const deletedByText = deletedByAdmin
      ? "The admin has deleted the property share."
      : "The property share has been deleted by the user who shared it.";

    /** ---------------- Notifications ---------------- **/

    // ---- Notify Shared BY User ----
    await createNotification({
      userId: sharedBy,
      message: `${propertyName} share has been removed. ${deletedByText}`,
      type: "property_share_deleted",
    });

    await sendPushNotification({
      userId: sharedBy,
      title: "Property Share Deleted",
      message: `${propertyName} share has been removed. ${deletedByText}`,
      urlPath: "Shared Properties",
    });

    // ---- Notify Shared WITH User ----
    await createNotification({
      userId: sharedWith,
      message: `${propertyName} shared with you has been deleted. ${deletedByText}`,
      type: "property_share_deleted",
    });

    await sendPushNotification({
      userId: sharedWith,
      title: "Shared Property Removed",
      message: `${propertyName} that was shared with you has been deleted. ${deletedByText}`,
      urlPath: "Shared Properties",
    });

    return res.json({
      success: true,
      message: "Property Share deleted successfully",
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getPropertyFeedbackByPropertyId = async (req, res) => {
  try {
    const propertyShareId = req.params.id;
    const preferenceFeedback = await PreferenceFeedbacks.findOne({ propertyShareId }).populate("userId").populate("propertyId");
    if (!preferenceFeedback) {
      return res
        .status(404)
        .json({ success: false, message: "Preference Feedback not found" });
    }
    return res.json({
      success: true,
      message: "Preference Feedback fetch successfully",
      data: {
        preferenceFeedback: preferenceFeedback,
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};