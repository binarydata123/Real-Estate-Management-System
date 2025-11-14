import express from "express";
import {
  askQuestion,
  generateSpeech,
  propertyPrompt,
  createAssistant,
} from "../../controllers/AI/assistantController.js";
import {
  createCustomerAssistant,
  startCustomerSession,
} from "../../controllers/AI/customerAssistant/index.js";
import {
  createPropertyAssistant,
  startPropertySession,
} from "../../controllers/AI/propertyAssistant/index.js";
import {
  createMeetingRecord,
  startMeetingSession,
} from "../../controllers/AI/meetingAssistant/index.js";

const router = express.Router();

// POST /api/assistant/ask
router.post("/ask", askQuestion);
router.post("/speak", generateSpeech);
router.get("/property-prompt/:propertyId/:userId", propertyPrompt);
router.post("/create", createAssistant);
router.post("/create-customer-assistant", createCustomerAssistant);
router.post("/start-customer-session", startCustomerSession);
router.post("/start-meeting-session", startMeetingSession);
router.post("/start-property-session", startPropertySession);
router.post("/create-property-assistant", createPropertyAssistant);

export default router;
