import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agencyId: {
<<<<<<< HEAD
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
=======
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true
>>>>>>> 1b6466c4eea3d4af416f1ac6529ba0e1018590a3
    },
    message: {
      type: String,
      required: true,
    },
    type: {
<<<<<<< HEAD
      type: String,
      enum: [
        "welcome",
        "new_lead",
        "task_assigned",
        "meeting_scheduled",
        "property_updated",
      ],
      default: "welcome",
=======
        type: String,
        enum: ['welcome', 'new_lead', 'task_assigned', 'meeting_scheduled', 'property_updated', 'property_added'],
        default: 'welcome'
>>>>>>> 1b6466c4eea3d4af416f1ac6529ba0e1018590a3
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
