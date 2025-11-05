import mongoose from "mongoose";

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    assistantId: { type: String },
    role: { type: String, enum: ["user", "assistant"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AIInteraction = mongoose.model(
  "AIInteraction",
  aiInteractionSchema
);
