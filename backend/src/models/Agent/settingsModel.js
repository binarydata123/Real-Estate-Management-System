import mongoose from "mongoose";

const AgencySettings = new mongoose.Schema(
  {
    agencySettings: {
      agencyName: {
        type: String,
        // trim: true,
        default: "",
      },
      workspaceUrl: {
        type: String,
        lowercase: true,
        // trim: true,
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
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      meetingReminders: {
        type: Boolean,
        default: true,
      },
      propertyUpdates: {
        type: Boolean,
        default: true,
      },
      customerActivity: {
        type: Boolean,
        default: true,
      },
      systemUpdates: {
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
