const meetingSchema = new mongoose.Schema({
    title: String,
    agenda: String,
    date: Date,
    time: String,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
    createdAt: { type: Date, default: Date.now },
});

export const Meeting = mongoose.model("Meeting", meetingSchema);
