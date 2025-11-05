import { AIInteraction } from "../../models/AI/AIInteraction.js";

export const logAIInteraction = async (req, res) => {
  try {
    const { userId, propertyId, assistantId, role, message } = req.body;

    if (!role || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Role and message are required." });
    }

    const interaction = await AIInteraction.create({
      userId,
      propertyId,
      assistantId,
      role,
      message,
    });

    res.status(201).json({ success: true, data: interaction });
  } catch (error) {
    console.error("❌ Error logging AI interaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log interaction",
    });
  }
};
