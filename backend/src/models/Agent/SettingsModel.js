const analyticsSchema = new mongoose.Schema({
    agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    totalProperties: Number,
    totalCustomers: Number,
    totalMeetings: Number,
    salesData: [
        {
            property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
            soldPrice: Number,
            soldDate: Date
        }
    ],
    createdAt: { type: Date, default: Date.now },
});

export const Analytics = mongoose.model("Analytics", analyticsSchema);
