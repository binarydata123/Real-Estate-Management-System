import mongoose from "mongoose";

const AgencySettings = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one settings document per user
    },

    agencySettings: {
      agencyName: {
        type: String,
        default: "",
      },
      workspaceUrl: {
        type: String,
        lowercase: true,
        default: "",
      },
    },

    branding: {
      primaryColor: {
        type: String,
        default: "#000000",
      },
      secondaryColor: {
        type: String,
        default: "#ffffff",
      },
      agencyLogoUrl: {
        type: String,
        default: "",
      },
    },

    notifications: {

      pushNotifications: {
        type: Boolean,
        default: true,
      },
      customerActivity: {
        type: Boolean,
        default: true,
      },
      propertyUpdates: {
        type: Boolean,
        default: true,
      },
      meetingReminders: {
        type: Boolean,
        default: true,
      },

    },

    security: {
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
      sessionTimeout: {
        type: String,
        enum: ["7 days", "15 days", "never"],
        default: "never",
      },
      loginNotifications: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.AgencySettings ||
  mongoose.model("AgencySettings", AgencySettings);
