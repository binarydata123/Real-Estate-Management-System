import mongoose from "mongoose";

const PropertyFeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Property",
    },

    liked: {
      type: Boolean,
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const PropertyFeedback = mongoose.model(
  "PreferenceFeedback",
  PropertyFeedbackSchema
);
