import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is not a valid email address'],
    },
    phone: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false, // Don't send back password field by default
    },
    role: {
        type: String,
        enum: ['admin', 'agent', 'customer'],
        default: 'agent',
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive'],
        default: 'active',
    },
    profilePictureUrl: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

export const User = mongoose.model('User', userSchema);