const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    gender: String,
    contactNumber: {
        type: String,
        unique: true
    },
    
    role:{
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isActive: {
    type: Boolean,
    default: true
  },

   otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);