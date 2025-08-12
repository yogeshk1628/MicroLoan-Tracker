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
});

module.exports = mongoose.model('User', userSchema);