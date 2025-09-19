import { Customer } from "../../models/Agent/CustomerModel.js";
import { Meetings } from "../../models/Agent/MeetingModel.js";
import { User } from "../../models/Common/UserModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import generateToken from "../../utils/generateToken.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const meeting = new Meetings(req.body);
    const savedMeeting = await meeting.save();
    console.log(savedMeeting);
    const user = req.user._id;
    const customer = await Customer.findOne({ _id: req.body.customerId });
    const agentToken = generateToken(req.user._id, req.user.role);
    console.log(agentToken);
    // const customerToken = generateToken(customer._id, customer.role);
    await createNotification({
      agencyId: req.body.agencyId,
      userId: user._id,
      message: `You have successfully scheduled a meeting with ${customer.fullName} on ${req.body.date} at ${req.body.time}.`,
      type: "meeting_scheduled",
    });
    await createNotification({
      userId: customer._id,
      message: `${user.name} has scheduled a meeting with you on ${req.body.date} at ${req.body.time}.`,
      type: "meeting_scheduled",
    });

    // ✅ Push notification to meeting creator
    await sendPushNotification({
      userId: user._id,
      meetingId: savedMeeting._id,
      token: agentToken,
      title: "Meeting Scheduled",
      message: `You have successfully scheduled a meeting with ${customer.fullName} on ${req.body.date} at ${req.body.time}.`,
      urlPath: "meetings",
    });

    // ✅ Push notification to another participant
    await sendPushNotification({
      userId: customer._id,
      meetingId: savedMeeting._id,
      title: "New Meeting Invitation",
      message: `${user.name} has scheduled a meeting with you on ${req.body.date} at ${req.body.time}.`,
      urlPath: "meetings",
    });

    res.status(201).json({ success: true, data: savedMeeting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /agents/meetings/get-all/:id?page=1&limit=10
export const getMeetingsByAgency = async (req, res) => {
  try {
    const id = req.user.agencyId;
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();

    let query = { agencyId: id };

    if (status === "upcoming") {
      query.$expr = {
        $and: [
          { $ne: ["$status", "cancelled"] },
          {
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
          },
        ],
      };
    } else if (status === "past") {
      query.$expr = {
        $and: [
          { $ne: ["$status", "cancelled"] },
          {
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
        ],
      };
    } else if (status === "cancelled") {
      query.status = "cancelled";
    }

    const total = await Meetings.countDocuments(query);

    const meetings = await Meetings.find(query)
      .populate("customerId", "fullName")
      .skip(skip)
      .limit(limit)
      .sort({ date: status === "past" ? -1 : 1 })
      .lean();

    const formattedMeetings = meetings.map((m) => ({
      ...m,
      customer: m.customerId,
      customerId: undefined,
      isPast: status === "past",
      // property: m.propertyId,
      // propertyId: undefined,
    }));

    res.json({
      success: true,
      data: formattedMeetings,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a meeting by ID
export const getMeetingById = async (req, res) => {
  try {
    const agencyId = req.user.agencyId;
    const meeting = await Meetings.findOne({ _id: req.params.id, agencyId });

    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    res.json({ success: true, data: meeting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a meeting
export const updateMeeting = async (req, res) => {
  try {
    const agencyId = req.user.agencyId;
    const updatedMeeting = await Meetings.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMeeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    res.json({ success: true, data: updatedMeeting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const updateMeetingStatus = async (req, res) => {
  try {
    console.log(req.body, req.params);
    const { status } = req.body; // only accept status
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const updatedMeeting = await Meetings.findByIdAndUpdate(
      req.params.id,
      { status }, // only update status
      { new: true, runValidators: true }
    );
    console.log(updatedMeeting);

    if (!updatedMeeting) {
      console.log("meeting not found");
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    res.json({ success: true, data: updatedMeeting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a meeting
export const deleteMeeting = async (req, res) => {
  try {
    const deletedMeeting = await Meetings.findByIdAndDelete(req.params.id);
    if (!deletedMeeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }
    res.json({ success: true, message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
