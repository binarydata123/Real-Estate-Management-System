import mongoose from "mongoose";

// const AdminSettingsSchema = new mongoose.Schema({
//   voiceLanguage: {
//     type: String,
//     enum: ["Hinglish", "English", "Hindi"],
//     default: "Hinglish",
//   },
//   // other global settings...
// });
const AdminSettingsSchema = new mongoose.Schema({
    logoUrl: { type: String },
    faviconUrl: { type: String },
    footerContent: { type: String, required: true },
    notificationEmailAlert: {type: Boolean, required: true},
    notificationLoginAlert: {type: Boolean, required: true},
    notificationUpdatesAlert: {type: Boolean, required: true},
    notificationSecurityAlert: {type: Boolean, required: true},
}, { timestamps: true });

export const AdminSettings = mongoose.model(
  "AdminSettings",
  AdminSettingsSchema
);





