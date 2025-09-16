import { Meetings } from "../../models/Agent/MeetingModel.js";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    console.log("calling create api");
    const meeting = new Meetings(req.body);
    const savedMeeting = await meeting.save();
    res.status(201).json({ success: true, data: savedMeeting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all meetings
// GET /agents/meetings/agency/:agencyId
export const getMeetingsByAgency = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);

    const meetings = await Meetings.find({ agency: id });
    // .populate("customer")
    // .populate("property")
    // .populate("agency");

    res.json({ success: true, data: meetings });
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
