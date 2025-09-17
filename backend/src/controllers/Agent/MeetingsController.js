import { Meetings } from "../../models/Agent/MeetingModel.js";
import { sendPushNotification } from "../../utils/pushService.js";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    console.log("calling create api");
    const meeting = new Meetings(req.body);
    const savedMeeting = await meeting.save();
    console.log(req.body.agency, req.body.customer);
    await sendPushNotification({
      userId: req.body._id,
      title: "New Request",
      message: `A meeting has been scheduled with ${req.body.customer} on ${req.body.date} at ${req.body.time}.`,
      urlPath: "",
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

    const total = await Meetings.countDocuments({ agency: id });
    const meetings = await Meetings.find({ agency: id })
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 }); // optional: sort by latest

    res.json({
      success: true,
      data: meetings,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
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
