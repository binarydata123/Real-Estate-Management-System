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

propertyShareSchema.virtual('customers', {
  ref: 'Customer',
  localField: 'sharedWithUserId',
  foreignField: '_id',
  justOne: true
});

propertyShareSchema.virtual('users', {
  ref: 'User',
  localField: 'sharedByUserId',
  foreignField: '_id',
  justOne: true
});

export const PropertyShare = mongoose.model(
  "PropertyShare",
  propertyShareSchema
);
