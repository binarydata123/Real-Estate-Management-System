import express from "express";
import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  getMeetingsByAgency,
  updateMeeting,
  updateMeetingStatus,
} from "../../../controllers/Agent/MeetingsController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post(
  "/create",
  protect(["admin", "agent"]),
  createMeeting
);

// Read
router.get(
  "/get-all",
  protect(["admin", "agent"]),
  getMeetingsByAgency
);
router.get(
  "/getById/:id",
  protect(["admin", "agent"]),
  getMeetingById
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent"]),
  updateMeeting
);
router.put(
  "/update-status/:id",
  protect(["admin", "agent"]),
  updateMeetingStatus
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  deleteMeeting
);

export default router;
