import express from "express";
import {
  askQuestion,
  generateSpeech,
  propertyPrompt,
  createAssistant,
} from "../../controllers/AI/assistantController.js";
import { logAIInteraction } from "../../controllers/AI/logAIInteractionController.js";

const router = express.Router();

// POST /api/assistant/ask
router.post("/ask", askQuestion);
// POST /api/assistant/speak
router.post("/speak", generateSpeech);
router.get("/property-prompt/:propertyId/:userId", propertyPrompt);
router.post("/create", createAssistant);
router.post("/log", logAIInteraction);

export default router;
