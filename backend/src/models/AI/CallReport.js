import mongoose from "mongoose";

const CallReportSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
      unique: true, // Calls should only be reported once
      index: true,
    },
    assistantId: {
      type: String,
      required: true,
    },
    status: {
      type: String, // e.g., 'ended'
      required: true,
    },
    summary: {
      type: String,
      required: false,
    },
    transcript: {
      type: String,
      required: false,
    },
    duration: {
      type: Number, // In seconds
      required: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Use existing model or create a new one
const CallReport =
  mongoose.models.CallReport || mongoose.model("CallReport", CallReportSchema);

export default CallReport;
