import mongoose from "mongoose";
const propertyShareSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    sharedWithUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    sharedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: String,
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "viewed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PropertyShare = mongoose.model(
  "PropertyShare",
  propertyShareSchema
);
