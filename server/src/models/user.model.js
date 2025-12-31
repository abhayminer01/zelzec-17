const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    location: {
        lat: String,
        lng: String
    },
    full_name: String,
    mobile: Number,
    address: String,
    products: {
        type: Number,
        default: 0
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    deletionScheduledAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;