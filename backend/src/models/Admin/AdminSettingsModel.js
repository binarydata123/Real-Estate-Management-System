import mongoose from "mongoose";

const AdminSettingsSchema = new mongoose.Schema({
  voiceLanguage: {
    type: String,
    enum: ["Hinglish", "English", "Hindi"],
    default: "Hinglish",
  },
  // other global settings...
});

export const AdminSettings = mongoose.model(
  "AdminSettings",
  AdminSettingsSchema
);
