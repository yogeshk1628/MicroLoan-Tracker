const Loan = require("../models/LoanModel");

// Create a new loan
const createLoan = async (req, res) => {
  try {
    const { loanAmount, interestRate, termMonths, purpose } = req.body;

    // Take user ID from token (req.user is set in verifyToken middleware)
    const userId = req.user.id;

    const newLoan = new Loan({
      user: userId,
      loanAmount,
      interestRate,
      termMonths,
      purpose
    });

    await newLoan.save();

    res.status(201).json({
      message: "Loan created successfully",
      loan: newLoan
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating loan",
      error: error.message
    });
  }
};

// Get all loans (optional: filter by status or user)
const getLoans = async (req, res) => {
  try {
    const { status, userId } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const loans = await Loan.find(filter).populate("user", "firstName lastName email");
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loans", error: error.message });
  }
};

// Get single loan by ID
const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate("user", "firstName lastName email");
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan", error: error.message });
  }
};

// Update loan details
const updateLoan = async (req, res) => {
  try {
    const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json({ message: "Loan updated successfully", loan: updatedLoan });
  } catch (error) {
    res.status(500).json({ message: "Error updating loan", error: error.message });
  }
};

// Delete a loan
const deleteLoan = async (req, res) => {
  try {
    const deletedLoan = await Loan.findByIdAndDelete(req.params.id);
    if (!deletedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting loan", error: error.message });
  }
};

module.exports = { createLoan, getLoans, getLoanById, updateLoan, deleteLoan }