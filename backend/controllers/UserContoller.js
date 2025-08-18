const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cors = require("cors");
const { sendWelcomeEmail } = require("../middleware/MailMiddleware");

const secretKey = process.env.JWT_SECRET;





const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, gender, contactNumber, role = "user" } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      contactNumber,
      role
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
      },
      secretKey,
      { expiresIn: '1y' }
    );
    
    res.status(200).json({ message: "Login succesfull", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow users to get their own data or admin to get any user data
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
  const { firstName, lastName, email, contactNumber, gender } = req.body;
  try {

      const updateDetails = await User.findByIdAndUpdate(id, { firstName, lastName, email, contactNumber, gender }, { new: true });
      if (!updateDetails) {
          res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "Details updated succesfully", data: updateDetails })
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
      if (!existingUser) return res.status(404).json({ message: "Not found" })

      const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
      if (!isMatch) return res.status(404).json({ message: "Current password is wrong" });
      if (confirmPassword !== newPassword) {
          return res.status(400).json({ message: "Incorrect password" })
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatePassword = await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

      res.status(200).json({ message: "Password updated", data: updatePassword });


  } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = { signup, loginUser, getUsersById, updateuserPassword, updateuserProfile }