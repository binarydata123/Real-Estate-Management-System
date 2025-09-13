const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    address: String,
    price: Number,
    images: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    status: { type: String, enum: ["Available", "Sold", "Rented"], default: "Available" },
    createdAt: { type: Date, default: Date.now },
});

export const Property = mongoose.model("Property", propertySchema);
