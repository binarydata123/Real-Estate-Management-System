import { Customer } from "../../models/Agent/CustomerModel.js";
import { Meetings } from "../../models/Agent/MeetingModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import generateToken from "../../utils/generateToken.js";
import { sendPushNotification } from "../../utils/pushService.js";
import AgencySettings from "../../models/Agent/settingsModel.js";
import CustomerSettings from "../../models/Customer/SettingsModel.js";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const meeting = new Meetings(req.body);
    const savedMeeting = await meeting.save();
    const user = req.user;
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    const agentToken = generateToken(req.user._id, req.user.role);
    const customerToken = generateToken(customer._id, customer.role);
    const agencySettings = await AgencySettings.findOne({
      userId: req.user._id,
    });
    const customerSettings = await CustomerSettings.findOne({
      userId: customer._id,
    });
    if (agencySettings?.notifications?.meetingReminders) {
      await createNotification({
        agencyId: req.body.agencyId,
        userId: user._id,
        message: `You have successfully scheduled a meeting with ${customer.fullName} on ${req.body.date} at ${req.body.time}.`,
        type: "meeting_scheduled",
      });
    }

    if (customerSettings?.notifications?.meetingReminders) {
      await createNotification({
        userId: customer._id,
        message: `${user.name} has scheduled a meeting with you on ${req.body.date} at ${req.body.time}.`,
        type: "meeting_scheduled",
      });
    }
    if (agencySettings?.notifications?.pushNotifications)
      await sendPushNotification({
        userId: user._id,
        title: "Meeting Scheduled",
        message: `You have successfully scheduled a meeting with ${customer.fullName} on ${req.body.date} at ${req.body.time}.`,
        urlPath: "/meetings",
        data: { meetingId: savedMeeting._id, token: agentToken },
        actions: [
          { action: "confirm", title: "👍 Confirm" },
          { action: "cancel", title: "👎 Cancel" },
        ],
      });

    if (customerSettings?.notifications?.pushNotifications)
      await sendPushNotification({
        userId: customer._id,
        title: "New Meeting Invitation",
        message: `${user.name} has scheduled a meeting with you on ${req.body.date} at ${req.body.time}.`,
        urlPath: "/meetings",
        data: { meetingId: savedMeeting._id, token: customerToken },
        actions: [
          { action: "confirm", title: "👍 Confirm" },
          { action: "cancel", title: "👎 Cancel" },
        ],
      });

    return res.status(201).json({ success: true, data: savedMeeting });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// GET /agents/meetings/get-all/:id?page=1&limit=10
export const getMeetingsByAgency = async (req, res) => {
  try {
    const id = req.user.agencyId._id._id;
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const now = new Date();

    const query = { agencyId: id };

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
      .populate("propertyId", "title")
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

// Update a meeting
export const updateMeeting = async (req, res) => {
  const { agencyId, customerId, date, propertyId, status, time } = req.body;
  let correctPropertyId;
  if (propertyId === "") {
    correctPropertyId = null;
  } else {
    correctPropertyId = propertyId;
  }
  const newBody = {
    agencyId,
    customerId,
    date,
    propertyId: correctPropertyId,
    status,
    time
  }
  console.log("New Body is : ", newBody);
  try {
    const updatedMeeting = await Meetings.findByIdAndUpdate(
      req.params.id,
      newBody,
      { new: true, runValidators: true }
    );

    if (!updatedMeeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    return res.json({ success: true, data: updatedMeeting });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const updateMeetingStatus = async (req, res) => {
  try {
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

    return res.json({ success: true, data: updatedMeeting });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
    return res.json({ success: true, message: "Meeting deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
