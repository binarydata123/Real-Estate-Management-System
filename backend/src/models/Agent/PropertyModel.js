const propertySchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },

  // Area & Configuration
  built_up_area: { type: Number, min: 0 },
  carpet_area: { type: Number, min: 0 },
  unit_area_type: {
    type: String,
    enum: ["sqft", "sqm", "acre", "marla", "kanal", "bigha", "sqyd", "hectare"],
    default: "sqft",
  },
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  balconies: { type: Number, min: 0 },
  floor_number: { type: Number, min: 0 },
  total_floors: { type: Number, min: 0 },

  // Facing / Overlooking
  facing: {
    type: String,
    enum: [
      "North", "South", "East", "West",
      "North-East", "North-West",
      "South-East", "South-West",
    ],
  },
  overlooking: [{ type: String }],

  // Age / Transaction Details
  property_age: { type: String, enum: ["New", "1-5 years", "5-10 years", "10+ years"] },
  transaction_type: { type: String, enum: ["New", "Resale"], default: "New" },
  ownership_type: {
    type: String,
    enum: ["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"],
  },
  gated_community: { type: Boolean, default: false },

  // Parking & Utilities
  parking_count: { type: Number, default: 0 },
  water_source: [{ type: String }],
  power_backup: { type: String, enum: ["None", "Partial", "Full"], default: "None" },

  // Features & Amenities
  flooring_type: { type: String },
  furnishing: { type: String, enum: ["Unfurnished", "Semi-Furnished", "Furnished"], default: "Unfurnished" },
  amenities: [{ type: String }],

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
  rera_status: { type: String, enum: ["Available", "Not Available", "Applied"], default: "Not Available" },
  rera_id: { type: String },

  // Owner Details
  owner_name: { type: String, trim: true },
  owner_contact: {
    type: String,
    match: [/^\+?[0-9]{7,15}$/, "Invalid phone number format"],
  },
  owner_type: { type: String, enum: ["Individual", "Dealer", "Builder", "Agency"], default: "Individual" },
  owner_notes: { type: String, trim: true },

  // Relational
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", index: true },
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
