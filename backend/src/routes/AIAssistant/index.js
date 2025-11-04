import express from "express";
import { askQuestion, generateSpeech, propertyPrompt } from "../../controllers/AI/assistantController.js";


const router = express.Router();


// POST /api/assistant/ask
router.post("/ask", askQuestion);
// POST /api/assistant/speak
router.post("/speak", generateSpeech);
router.get("/property-prompt/:propertyId/:userId", propertyPrompt);

export default router;