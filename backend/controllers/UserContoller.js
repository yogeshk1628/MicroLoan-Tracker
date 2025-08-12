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

module.exports = { signup, loginUser }