const Loan = require("../models/LoanModel");

const createLoan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Create repayment schedule (60 days × ₹100/day)
    let repayments = [];
    for (let day = 1; day <= 60; day++) {
      repayments.push({
        day,
        dueAmount: 100,
        paidAmount: 0,
        isPaid: false
      });
    }

    const newLoan = new Loan({
      user: userId,
      loanAmount: 5000,
      interestRate: 20, // percent
      termDays: 60,
      dailyPayment: 100,
      status: "active",
      repayments
    });

    await newLoan.save();

    res.status(201).json({
      message: "Loan created successfully with fixed terms",
      loan: newLoan
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating loan",
      error: error.message
    });
  }
};

const DAILY_PAYMENT = 100;
const PENALTY_RATE = 0.2; // 20% per day on missed amount

const calculatePenalties = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const startDate = new Date(loan.createdAt); // when loan was created
    const today = new Date();

    let balance = 0;
    let missedPayments = []; // store { day, amountMissed }

    const totalDays = Math.min(
      Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
      loan.termDays || 60 // default 60 days
    );

    for (let day = 1; day <= totalDays; day++) {
      // Add today's scheduled payment
      let todayPayment = DAILY_PAYMENT;

      // Check penalties from previous missed payments
      missedPayments = missedPayments.map(missed => {
        missed.amountMissed += missed.amountMissed * PENALTY_RATE; // apply penalty
        return missed;
      });

      // Add today's payment to missedPayments (assuming missed)
      missedPayments.push({ day, amountMissed: todayPayment });

      // Sum all missed amounts
      balance = missedPayments.reduce((sum, mp) => sum + mp.amountMissed, 0);
    }

    res.json({
      loanId,
      totalDays,
      remainingBalance: Number(balance.toFixed(2)),
      missedPayments: missedPayments.map(mp => ({
        day: mp.day,
        amount: Number(mp.amountMissed.toFixed(2)),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating penalties", error: error.message });
  }
};

const confirmRepayment = async (req, res) => {
  try {
    const { loanId, day, isPaid } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const repayment = loan.repayments.find(r => r.day === day);
    if (!repayment) return res.status(404).json({ message: "Repayment day not found" });

    if (isPaid) {
      repayment.isPaid = true;
      repayment.paidAmount = repayment.dueAmount;
    } else {
      repayment.isPaid = false;
      // Apply 20% penalty to unpaid amount
      const penalty = repayment.dueAmount * 0.2;
      repayment.dueAmount += penalty;

      // Add unpaid amount to next day's due
      const nextRepayment = loan.repayments.find(r => r.day === day + 1);
      if (nextRepayment) {
        nextRepayment.dueAmount += repayment.dueAmount; 
      }
    }

    await loan.save();
    res.json({ message: "Repayment updated", loan });
  } catch (error) {
    res.status(500).json({ message: "Error updating repayment", error: error.message });
  }
};

const getRemainingBalance = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Calculate balance from unpaid repayments
    const remainingBalance = loan.repayments
      .filter(r => !r.isPaid) // only unpaid days
      .reduce((sum, r) => sum + r.dueAmount, 0);

    res.status(200).json({
      loanId: loan._id,
      remainingBalance: Number(remainingBalance.toFixed(2))
    });

  } catch (error) {
    res.status(500).json({ message: "Error calculating remaining balance", error: error.message });
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

module.exports = { createLoan, calculatePenalties, confirmRepayment, getRemainingBalance, getLoans, getLoanById, updateLoan, deleteLoan }