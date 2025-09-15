const propertySchema = new mongoose.Schema({
    // Basic Info
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true },
    location: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },

    // Images
    images: [
        {
            url: { type: String, required: true },
            alt: { type: String },
            isPrimary: { type: Boolean, default: false },
        },
    ],

    // Property Type & Category
    type: {
        type: String,
        enum: ["residential", "commercial"],
        required: true,
        index: true,
    },
    category: {
        type: String,
        required: true,
        enum: [
            "apartment",
            "house",
            "villa",
            "land",
            "office",
            "shop",
            "warehouse",
            "other",
        ],
    },

    // Specifications
    size: { type: Number, min: 0 },
    size_unit: {
        type: String,
        enum: ["sqft", "sqm", "acre", "hectare"],
        default: "sqft",
    },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    amenities: [{ type: String }], // e.g., ["parking", "gym", "pool"]

    // Private Owner Details
    owner_name: { type: String, trim: true },
    owner_contact: {
        type: String,
        match: [/^\+?[0-9]{7,15}$/, "Invalid phone number format"],
    },
    owner_notes: { type: String, trim: true },

    // Relational & Status
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
