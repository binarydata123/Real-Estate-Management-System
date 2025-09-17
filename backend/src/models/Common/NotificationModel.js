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
        "task_assigned",
        "meeting_scheduled",
        "property_updated",
        "property_added",
      ],
      default: "welcome",
    },
    read: {
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
