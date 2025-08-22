const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cors = require("cors");
const { sendWelcomeEmail } = require("../middleware/MailMiddleware");

const secretKey = process.env.JWT_SECRET;

const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/(?=.*[^a-zA-Z\d])/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, contactNumber, role = "user", isActive } = req.body;
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      contactNumber,
      role,
      isActive
    });

    await newUser.save();
    await sendWelcomeEmail(newUser.email, newUser.firstName);
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error creating account", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found!" });
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        contactNumber: existingUser.contactNumber,
        gender: existingUser.gender,
        isActive: existingUser.isActive,
      },
      secretKey,
      { expiresIn: '1y' }
    );
    
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

const updateuserProfile = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, contactNumber, gender, password } = req.body;
  
  try {
    const updateData = {
      firstName,
      lastName,
      email,
      contactNumber,
      gender
    };

    if (password && password.trim() !== '') {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    const updateDetails = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
    if (!updateDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "Profile updated successfully", data: updateDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const updateuserPassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    
    if (confirmPassword !== newPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatePassword = await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).select('-password');

    res.status(200).json({ message: "Password updated successfully", data: updatePassword });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ 
      message: "User status updated successfully", 
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: { 
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS 
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend Password Reset OTP",
      text: `Your new OTP is ${otp}. It will expire in 5 minutes.`
    });

    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { 
  signup, 
  loginUser, 
  getUsersById, 
  updateuserPassword, 
  updateuserProfile, 
  toggleUserStatus, 
  forgotPassword, 
  verifyOtp, 
  resendOtp, 
  resetPassword 
};
