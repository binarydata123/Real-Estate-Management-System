// models/PropertyAICache.js
import mongoose from "mongoose";

const propertyAICacheSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  userQuery: { type: String, required: true },
  aiResponse: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

propertyAICacheSchema.index({ propertyId: 1, userQuery: 1 }, { unique: true });

export default mongoose.model("PropertyAICache", propertyAICacheSchema);
