import mongoose from "mongoose";

const qrLoginSessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "consumed"],
      default: "pending",
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    role: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    consumedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    collection: "qrLoginSessions",
  },
);

qrLoginSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const QrLoginSession = mongoose.model("QrLoginSession", qrLoginSessionSchema);

export default QrLoginSession;
