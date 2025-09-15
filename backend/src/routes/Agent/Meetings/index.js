import express from "express";
import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  getMeetings,
  updateMeeting,
} from "../../../controllers/Agent/MeetingsController.js";

const router = express.Router();

// Create
router.post("/create", createMeeting);

// Read
router.get("/get-all", getMeetings);
router.get("/getById/:id", getMeetingById);

// Update
router.put("/update/:id", updateMeeting);

// Delete
router.delete("/delete/:id", deleteMeeting);

export default router;
