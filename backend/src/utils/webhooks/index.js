import { AIInteraction } from "../../models/AI/AIInteraction.js";

// POST /assistant/webhook
export const handleVapiWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log("🎧 Incoming Vapi Webhook:", event.type);

    // Example: event.type === 'recording.available'
    if (event.type === "recording.available") {
      const { recordingUrl, sessionId } = event.data;
      if (sessionId) {
        await AIInteraction.findByIdAndUpdate(sessionId, {
          recordingUrl,
          endTime: new Date(),
        });
        console.log("✅ Session recording saved:", recordingUrl);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error handling Vapi webhook:", error);
    res.sendStatus(500);
  }
};
