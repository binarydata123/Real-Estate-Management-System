import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    agency: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Agent = mongoose.model("Agent", agentSchema);
export default Agent;
