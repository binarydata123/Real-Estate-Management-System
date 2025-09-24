import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // A user should have only one preference document
    },
    userType: {
        type: String,
        enum: ['buyer', 'investor'],
        default: 'buyer'
    },
    lookingFor: {
        type: String,
        enum: ['buy', 'rent'],
        default: 'buy'
    },
    type: {
        type: String,
        enum: ['residential', 'commercial'],
    },
    category: {
        type: [String],
        default: []
    },
    minPrice: {
        type: Number,
    },
    maxPrice: {
        type: Number,
    },
    bedrooms: {
        type: [String],
        default: []
    },
    bathrooms: {
        type: [String],
        default: []
    },
    furnishing: {
        type: [String],
        default: []
    },
    amenities: {
        type: [String],
        default: []
    },
    features: {
        type: [String],
        default: []
    },
    facing: {
        type: [String],
        default: []
    },
    reraStatus: {
        type: [String],
        default: []
    },
}, { timestamps: true });

export const Preference = mongoose.model('Preference', preferenceSchema);
