import mongoose from "mongoose";


const propertySchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['residential', 'commercial'], required: true },
  category: { type: String, enum: ['plot', 'flat', 'showroom', 'office', 'villa', 'land', 'farmHouse'], required: true },
  description: { type: String, trim: true },
  location: { type: String, index: true },
  price: { type: Number, min: 0 },

  // Area & Configuration
  built_up_area: { type: Number, min: 0 },
  carpet_area: { type: Number, min: 0 },
  unit_area_type: {
    type: String,
    enum: ["sqft", "sqm", "acre", "marla", "kanal", "bigha", "sqyd", "hectare", "gaj"],
    default: "sqft",
  },

  // Plot specific
  plot_front_area: { type: Number, min: 0 },
  plot_depth_area: { type: Number, min: 0 },
  plot_dimension_unit: { type: String, enum: ["ft", "m"] },
  is_corner_plot: { type: Boolean, default: false },

  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  balconies: { type: Number, min: 0 },
  floor_number: { type: Number, min: 0 },
  total_floors: { type: Number, min: 0 },

  // Commercial specific
  washrooms: { type: Number, min: 0 },
  cabins: { type: Number, min: 0 },
  conference_rooms: { type: Number, min: 0 },

  // Facing / Overlooking
  facing: {
    type: String,
    enum: [
      "",
      "North", "South", "East", "West",
      "North-East", "North-West",
      "South-East", "South-West",
    ],
  },
  overlooking: [{ type: String }],

  // Age / Transaction Details
  property_age: { type: String, enum: ["", "New", "1-5 years", "5-10 years", "10+ years"] },
  transaction_type: { type: String, enum: ["New", "Resale"], default: "New" },
  gated_community: { type: Boolean, default: false },

  // Parking & Utilities
  water_source: [{ type: String }],
  power_backup: { type: String, enum: ["None", "Partial", "Full"], default: "None" },

  // Features & Amenities
  furnishing: { type: String, enum: ["Unfurnished", "Semi-Furnished", "Furnished"], default: "Unfurnished" },
  flooring_type: { type: String, enum: ['Marble', 'Vitrified', 'Wooden', 'Ceramic', 'Mosaic', 'Granite', 'Other'] },
  amenities: [{ type: String }],
  features: [{ type: String }],

  // Images
  images: [
    {
      url: { type: String, required: true },
      alt: { type: String },
      isPrimary: { type: Boolean, default: false },
    },
  ],

  // Codes & Identifiers
  property_code: { type: String, unique: true },
  rera_status: { type: String, enum: ["Approved", "Not Approved", "Applied"], default: "Not Approved" },

  // Owner Details
  owner_name: { type: String, trim: true },
  owner_contact: {
    type: String,
    match: [/^\+?[0-9]{7,15}$/, "Invalid phone number format"],
  },

  // Relational
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", index: true },
  status: {
    type: String,
    enum: ["Available", "Pending", "Sold", "Rented"],
    default: "Available",
    index: true,
  },
},
  { timestamps: true }
);

export const Property = mongoose.model("Property", propertySchema);
