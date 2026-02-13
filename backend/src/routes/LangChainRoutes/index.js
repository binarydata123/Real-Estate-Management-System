import express from "express";
const router = express.Router();
import { protect } from "../../middleware/authMiddleware.js";
import { handleVoiceCommand } from "../../langChainAgent/CustomerAgent.js";

// Route to handle voice assistant logic
router.post(
  "/voice-assistant-save-customer",
  protect(["agent", "admin"]),
  async (req, res) => {
    try {
      const { message, threadId, agencyId } = req.body;

      const result = await handleVoiceCommand(
        message,
        agencyId,
        threadId
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;