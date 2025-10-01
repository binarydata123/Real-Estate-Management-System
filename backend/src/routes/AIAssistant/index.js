import express from "express";
import { askQuestion, generateSpeech } from "../../controllers/assistantController.js";


const router = express.Router();


// POST /api/assistant/ask
router.post("/ask", askQuestion);
// POST /api/assistant/speak
router.post("/speak", generateSpeech);

export default router;