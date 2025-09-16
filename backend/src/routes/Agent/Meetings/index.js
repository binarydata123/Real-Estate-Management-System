import express from "express";
import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  getMeetingsByAgency,
  updateMeeting,
  updateMeetingStatus,
} from "../../../controllers/Agent/MeetingsController.js";

const router = express.Router();

// Create
router.post("/create", createMeeting);

// Read
router.get("/get-all/:id", getMeetingsByAgency);
router.get("/getById/:id", getMeetingById);

// Update
router.put("/update/:id", updateMeeting);
router.put("/update-status/:id", updateMeetingStatus);

// Delete
router.delete("/delete/:id", deleteMeeting);

export default router;
