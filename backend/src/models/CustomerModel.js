const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    role: { type: String, enum: ["Admin", "Agent", "Customer"], default: "Customer" },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
