import express from "express";
import {
  askQuestion,
  generateSpeech,
  propertyPrompt,
  createAssistant,
  createCustomerAssistant,
  createCustomerRecord,
  startCustomerSession,
  handleVapiWebhook,
} from "../../controllers/AI/assistantController.js";
import {
  logAISessionMessage,
  startAISession,
} from "../../controllers/AI/logAIInteractionController.js";

const router = express.Router();

// POST /api/assistant/ask
router.post("/ask", askQuestion);
// POST /api/assistant/speak
router.post("/speak", generateSpeech);
router.get("/property-prompt/:propertyId/:userId", propertyPrompt);
router.post("/create", createAssistant);
router.post("/log", logAISessionMessage);
router.post("/start-session", startAISession);
router.post("/create-customer-assistant", createCustomerAssistant);
router.post("/create-customer-record", createCustomerRecord);
router.post("/start-customer-session", startCustomerSession);
router.post("/webhook", handleVapiWebhook);
export default router;
