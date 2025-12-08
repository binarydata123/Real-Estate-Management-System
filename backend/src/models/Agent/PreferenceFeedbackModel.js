import mongoose from "mongoose";

const preferenceFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    liked: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// FIX: prevents OverwriteModelError
export const PreferenceFeedbacks =
  mongoose.models.PreferenceFeedback ||
  mongoose.model("PreferenceFeedback", preferenceFeedbackSchema);
