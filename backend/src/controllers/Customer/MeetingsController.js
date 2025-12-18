import { Meetings } from "../../models/Agent/MeetingModel.js";

export const getMeetingsByCustomer = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();

    const query = { customerId };

    if (status === "upcoming") {
      query.status = { $nin: ["cancelled", "past"] };
      query.$expr = {
        $gte: [
          {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  "T",
                  "$time",
                  ":00",
                ],
              },
            },
          },
          now,
        ],
      };
    } else if (status === "past") {
      query.$or = [
        { status: "past" },
        {
          status: { $ne: "cancelled" },
          $expr: {
            $lt: [
              {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                      "T",
                      "$time",
                      ":00",
                    ],
                  },
                },
              },
              now,
            ],
          },
        },
      ];
    } else if (status === "cancelled") {
      query.status = "cancelled";
    }

    const total = await Meetings.countDocuments(query);

    const meetings = await Meetings.find(query)
      .populate("propertyId", "title")
      .populate("agencyId", "name")
      .skip(skip)
      .limit(limit)
      .sort({ date: status === "past" ? -1 : 1 })
      .lean();

    const formattedMeetings = meetings.map((m) => {
      // Check if meeting time has passed
      const [hours, minutes] = m.time.split(":").map(Number);
      const meetingDateTime = new Date(m.date);
      meetingDateTime.setHours(hours, minutes, 0, 0);
      const hasPassed = meetingDateTime < now;

      return {
        ...m,
        property: m.propertyId,
        isPast: m.status === "past" || hasPassed,
      };
    });

    return res.json({
      success: true,
      data: formattedMeetings,
      total,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// Get a meeting by ID
export const getMeetingById = async (req, res) => {
  try {
    const agencyId = req.user.agencyId._id._id;
    const meeting = await Meetings.findOne({ _id: req.params.id, agencyId });

    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    return res.json({ success: true, data: meeting });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Customer: update meeting status (cancel / reschedule)
export const updateMeetingStatusByCustomer = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const meeting = await Meetings.findOneAndUpdate(
      {
        _id: req.params.id, // Use _id
        customerId,
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or unauthorized",
      });
    }
    return res.json({ success: true, data: meeting });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMeetingByCustomer = async (req, res) => {
  try {
    const meetingId = req.params.id;
    const customerId = req.user._id; // ✅ Get from auth middleware

    // 🔐 Only allow date and time for customer (NOT status)
    const allowedFields = ["date", "time"]; // ✅ REMOVED "status"
    const payload = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    });

    payload.status = "scheduled";

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedMeeting = await Meetings.findOneAndUpdate(
      {
        _id: meetingId,
        customerId, // Ensure customer can only update their own meetings
      },
      { $set: payload },
      { new: true, runValidators: true, context: "query" }
    ).populate("agencyId", "name"); 

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Meeting updated successfully",
      data: updatedMeeting,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
