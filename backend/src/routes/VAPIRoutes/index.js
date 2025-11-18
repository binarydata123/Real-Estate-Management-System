import express from "express";
const router = express.Router();
import { protect } from "../../middleware/authMiddleware.js";
import { createCustomerRecord } from "../../controllers/AI/customerAssistant/index.js";
import {
  createPropertyRecord,
  createPropertyFeedback,
} from "../../controllers/AI/propertyAssistant/index.js";
import { createMeetingRecord } from "../../controllers/AI/meetingAssistant/index.js";

router.post("/save-lead", createCustomerRecord);
router.post(
  "/save-property",
  protect(["agent", "admin"]),
  createPropertyRecord
);
router.post(
  "/schedule-meeting",
  protect(["agent", "admin"]),
  createMeetingRecord
);
router.post(
  "/save-property-feedback",
  protect(["agent", "admin", "customer"]),
  createPropertyFeedback
);
export default router;
