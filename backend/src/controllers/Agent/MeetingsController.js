import { Customer } from "../../models/Agent/CustomerModel.js";
import { Meetings } from "../../models/Agent/MeetingModel.js";
import { User } from "../../models/Common/UserModel.js";
import { createNotification } from "../../utils/apiFunctions/Notifications/index.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const meeting = new Meetings(req.body);
    const savedMeeting = await meeting.save();
    const user = await User.findOne({ agencyId: req.body.agencyId });
    const customer = await Customer.findOne({ _id: req.body.customerId });
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
      title: "Meeting Scheduled",
      message: `You have successfully scheduled a meeting with ${customer.fullName} on ${req.body.date} at ${req.body.time}.`,
      urlPath: "meetings",
    });

    // ✅ Push notification to another participant
    await sendPushNotification({
      userId: customer._id,
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
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Meetings.countDocuments({ agencyId: id });
    const meetings = await Meetings.find({ agencyId: id })
      .populate("customerId", "fullName")
      // .populate("propertyId", "title")
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 })
      .lean();

    const formattedMeetings = meetings.map((m) => ({
      ...m,
      customer: m.customerId,
      customerId: undefined,
      // property: m.propertyId,
      // propertyId: undefined,
    }));

    res.json({ success: true, data: formattedMeetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a meeting by ID
export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meetings.findById(req.params.id);

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
    const { status } = req.body; // only accept status
    console.log(req.body);
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
