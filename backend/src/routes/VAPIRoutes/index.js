import express from "express";
const router = express.Router();
import { protect } from "../../middleware/authMiddleware.js";
import { createCustomerRecord } from "../../controllers/AI/customerAssistant/index.js";
import { createPropertyRecord } from "../../controllers/AI/propertyAssistant/index.js";
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
export default router;
