import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "Customer Addition",
        "Customer Updated",
        "Customer Deletion",
        "Meeting Creation",
        "Meeting Updated",
        "Meeting cancelled",
        "Property Creation",
        "Property Deleted",
        "Settings Updated",
        "Property Shared",
      ],
      required: true,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const activityLog = new mongoose.model("activityLog", logSchema);
