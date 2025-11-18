import mongoose from "mongoose";

const aiInteractionSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assistantId: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    recordingUrl: { type: String }, // from Vapi recording
    logs: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const AIInteraction = mongoose.model(
  "AIInteraction",
  aiInteractionSchema
);
