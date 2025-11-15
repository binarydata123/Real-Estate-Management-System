import express from "express";
import {
  // askQuestion,
  // generateSpeech,
  propertyPrompt,
  createAssistant,
  startPreferenceSession,
} from "../../controllers/AI/assistantController.js";
import {
  createCustomerAssistant,
  startCustomerSession,
} from "../../controllers/AI/customerAssistant/index.js";
import {
  createPropertyAssistant,
  startPropertySession,
} from "../../controllers/AI/propertyAssistant/index.js";
import { startMeetingSession } from "../../controllers/AI/meetingAssistant/index.js";

const router = express.Router();

// POST /api/assistant/ask
router.get("/property-prompt/:propertyId/:userId", propertyPrompt);
router.post("/create", createAssistant);
router.post("/create-customer-assistant", createCustomerAssistant);
router.post("/start-customer-session", startCustomerSession);
router.post("/start-meeting-session", startMeetingSession);
router.post("/start-property-session", startPropertySession);
router.post("/start-preference-session", startPreferenceSession);
router.post("/create-property-assistant", createPropertyAssistant);

export default router;
