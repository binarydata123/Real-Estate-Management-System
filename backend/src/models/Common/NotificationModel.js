import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "welcome",
        "new_lead",
        "lead_updated",
        "task_assigned",
        "meeting_scheduled",
        "property_updated",
        "property_added",
        "property_deleted",
        "preference_request",
        "property_share",
        "property_feedback",
        "property_share_deleted"
      ],
      default: "welcome",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
