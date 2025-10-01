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
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  createMeeting
);

// Read
router.get(
  "/get-all",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  getMeetingsByAgency
);
router.get(
  "/getById/:id",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  getMeetingById
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  updateMeeting
);
router.put(
  "/update-status/:id",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  updateMeetingStatus
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]),
  deleteMeeting
);

export default router;
