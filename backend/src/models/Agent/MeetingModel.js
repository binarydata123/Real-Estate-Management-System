import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: [true, "Customer is required"],
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    default: null,
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: [true, "Agency is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
  },
  status: {
    type: String,
    enum: {
      values: ["scheduled", "completed", "cancelled", "rescheduled"],
      message:
        "Status must be one of: scheduled, completed, cancelled, rescheduled",
    },
    default: "scheduled",
  },
  time: {
    type: String,
    match: [
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Time must be in HH:mm format",
    ],
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

export const Meetings = mongoose.model("Meetings", meetingSchema);
