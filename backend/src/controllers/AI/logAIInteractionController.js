import { AIInteraction } from "../../models/AI/AIInteraction.js";

// 🧠 Start a new AI session
export const startAISession = async (req, res) => {
  try {
    const { propertyId, userId, assistantId } = req.body;

    const session = await AIInteraction.create({
      propertyId,
      userId,
      assistantId,
      startTime: new Date(),
    });

    res.json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error("❌ Error starting AI session:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🧠 Log messages for an existing session
export const logAISessionMessage = async (req, res) => {
  try {
    const { sessionId, role, message } = req.body;
    if (!sessionId)
      return res
        .status(400)
        .json({ success: false, message: "Missing sessionId" });

    const session = await AIInteraction.findById(sessionId);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    session.logs.push({ role, message });
    await session.save();

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error logging AI message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
