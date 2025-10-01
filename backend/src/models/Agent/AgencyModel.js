import mongoose from "mongoose";

const agencySchema = new mongoose.Schema(
  {
    name: {
      // Renamed from agencyName for consistency
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      // Added from registration form
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    owner: {
      // Added to link to the creating user
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      // Admin/contact email for the agency
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: String,
    logoUrl: String, // Consolidated from `logo` and `branding.logoUrl`
    status: {
      // Added from frontend type
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // reference to Users
    branding: {
      // Updated branding object
      primaryColor: String,
      secondaryColor: String,
      footerText: String,
    },
    // Optional fields for more details
    website: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
    },
  },
  {
    // Use timestamps for createdAt and updatedAt
    timestamps: true,
    // Include virtuals in toJSON() and toObject() output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for member count to align with frontend `Agency` type
agencySchema.virtual("members").get(function () {
  // `this.teamMembers` includes the owner, so we add 1 if owner is not in teamMembers yet.
  // A better approach would be to ensure the owner is always in teamMembers.
  // For now, we'll just count the array.
  return this.teamMembers ? this.teamMembers.length : 0;
});

agencySchema.virtual('properties', {
  ref: 'Property',       // The model to use
  localField: '_id',     // Field in Agency
  foreignField: 'agency',// Field in Property
});

export const Agency = mongoose.model("Agency", agencySchema);
