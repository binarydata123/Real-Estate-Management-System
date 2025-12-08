import express from "express";
import {
  getMeetings,
  updateMeeting,
  deleteMeeting
} from "../../../controllers/Admin/MeetingsController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();



// Using a more RESTful approach for property routes.
// This assumes the router is mounted at a path like `/api/agent/properties`.

router.get(
  "/get-all-meetings",
  protect(["admin", "agent", "customer"]),
  getMeetings
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent", "customer"]),
  updateMeeting
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agent", "customer"]),
  deleteMeeting
);

export default router;