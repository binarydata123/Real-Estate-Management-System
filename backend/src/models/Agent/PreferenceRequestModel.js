import mongoose from "mongoose";

const preferenceRequestSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agency",
        required: true,
    },
    sentByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The agent who sent the request
        required: true,
    },
    sentToUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer", // The customer who received the request
        required: true,
    },
    status: {
        type: String,
        enum: ["sent", "fulfilled", "rejected", "cancelled", "accepted", "pending"],
        default: "pending",
    },
}, { timestamps: true });

export const PreferenceRequest = mongoose.model('PreferenceRequest', preferenceRequestSchema);
