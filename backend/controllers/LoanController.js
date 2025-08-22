const Loan = require("../models/LoanModel");

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function calculateSchedule(loan, opts = {}) {
  const penaltyRate = opts.penaltyRate ?? 0.2;
  const base = loan.dailyPayment ?? 100;

  const repayments = loan.repayments || [];
  const breakdown = [];

  let totalPenalties = 0;
  let totalRemaining = 0;
  let prevCarry = 0;

  // Find the last day with any payment activity
  let lastActiveDay = -1;
  for (let i = 0; i < repayments.length; i++) {
    if ((repayments[i].paidAmount || 0) > 0) {
      lastActiveDay = i;
    }
  }

  for (let i = 0; i < repayments.length; i++) {
    const r = repayments[i];
    const paid = r.paidAmount || 0;

    let penaltyApplied, carryForward, isPaid, totalDueForDay, unpaidAmount;

    // Only calculate penalties and carry forward up to one day after the last payment
    if (lastActiveDay === -1 || i <= lastActiveDay + 1) {
      penaltyApplied = round2(prevCarry > 0 ? prevCarry * penaltyRate : 0);
      totalDueForDay = round2(base + prevCarry + penaltyApplied);
      unpaidAmount = round2(Math.max(0, totalDueForDay - paid));
      carryForward = unpaidAmount;
      
      // CHANGED: Mark as paid if ANY payment is made (even partial)
      isPaid = paid > 0;
      
    } else {
      // Future days beyond last activity: reset to defaults
      penaltyApplied = 0;
      totalDueForDay = base;
      unpaidAmount = 0;
      carryForward = 0;
      isPaid = false;
      prevCarry = 0; // Stop carry propagation
    }

    breakdown.push({
      day: r.day,
      dueAmount: base,
      paidAmount: paid,
      penaltyApplied,
      carryForwardFromPrevious: prevCarry,
      totalDueForDay,
      unpaidAmount,
      carryForward,
      isPaid
    });

    totalPenalties = round2(totalPenalties + penaltyApplied);
    totalRemaining = round2(totalRemaining + carryForward);

    prevCarry = carryForward;
  }

  return {
    loanId: loan._id,
    borrower: loan.user ? `${loan.user.firstName} ${loan.user.lastName}` : undefined,
    totalRemaining,
    totalPenalties,
    breakdown
  };
}

const createLoan = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.id;
    const role = req.user?.role;
    const requestedUserId = req.body.userId;
    const userId = role === "admin" && requestedUserId ? requestedUserId : authenticatedUserId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication failed",
        error: "No user ID found"
      });
    }

    const existingLoan = await Loan.findOne({
      user: userId,
      status: { $in: ["pending", "active"] }
    });

    if (existingLoan) {
      return res.status(400).json({
        message: "User already has an active or pending loan",
        error: "Duplicate loan application"
      });
    }

    const loanAmount = req.body.loanAmount ?? 5000;
    const termDays = req.body.termDays ?? 60;
    const dailyPayment = req.body.dailyPayment ?? 100;
    const interestRate = req.body.interestRate ?? 20;

    const repayments = Array.from({ length: termDays }, (_, i) => ({
      day: i + 1,
      dueAmount: dailyPayment,
      paidAmount: 0,
      isPaid: false,
      penaltyAmount: 0
    }));

    const newLoan = new Loan({
      user: userId,
      loanAmount,
      interestRate,
      termDays,
      dailyPayment,
      status: "pending",
      repayments,
      totalPenalties: 0
    });

    await newLoan.save();

    res.status(201).json({
      message: "Loan created successfully",
      loan: newLoan
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating loan",
      error: error.message || "Internal server error"
    });
  }
};

const processPayment = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { day, amount } = req.body;

    if (!day || !amount || amount <= 0) {
      return res.status(400).json({ message: "Valid day and amount are required" });
    }

    const loan = await Loan.findById(loanId).populate("user");
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const idx = loan.repayments.findIndex(r => r.day === Number(day));
    if (idx === -1) {
      return res.status(404).json({ message: "Repayment day not found" });
    }

    // Increment today's paid amount
    const prevPaid = loan.repayments[idx].paidAmount || 0;
    let newPaid = round2(prevPaid + amount);

    loan.repayments[idx].paidAmount = newPaid;
    loan.repayments[idx].paymentDate = new Date();

    // Recompute after recording this payment
    const balance = calculateSchedule(loan);

    // Persist penalty and status flags for transparency in UI
    for (const b of balance.breakdown) {
      const rIdx = loan.repayments.findIndex(r => r.day === b.day);
      if (rIdx >= 0) {
        loan.repayments[rIdx].penaltyAmount = b.penaltyApplied;
        loan.repayments[rIdx].isPaid = b.isPaid;
      }
    }
    loan.totalPenalties = balance.totalPenalties;

    await loan.save();

    return res.status(200).json({
      message: "Payment processed successfully",
      repayment: loan.repayments[idx],
      updatedBalance: balance,
      paidAmount: newPaid
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getRemainingBalance = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId).populate("user");
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const balance = calculateSchedule(loan);

    // Update stored values to match calculated values
    for (const b of balance.breakdown) {
      const idx = loan.repayments.findIndex(r => r.day === b.day);
      if (idx >= 0) {
        loan.repayments[idx].penaltyAmount = b.penaltyApplied;
        loan.repayments[idx].isPaid = b.isPaid;
      }
    }
    loan.totalPenalties = balance.totalPenalties;

    await loan.save();

    return res.status(200).json(balance);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Loan ID is required" });

    const loan = await Loan.findById(id).populate("user", "firstName lastName email");
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    if (req.user.role !== "admin" && loan.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const balance = calculateSchedule(loan);
    for (const b of balance.breakdown) {
      const idx = loan.repayments.findIndex(r => r.day === b.day);
      if (idx >= 0) {
        loan.repayments[idx].penaltyAmount = b.penaltyApplied;
        loan.repayments[idx].isPaid = b.isPaid;
      }
    }
    loan.totalPenalties = balance.totalPenalties;

    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan", error: error.message });
  }
};

const getLoans = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const loans = await Loan.find(filter).populate("user", "firstName lastName email");

    const result = loans.map(loan => {
      const balance = calculateSchedule(loan);
      return {
        ...loan.toObject(),
        computed: balance
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loans", error: error.message });
  }
};

const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Loan ID is required" });
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const updatedLoan = await Loan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedLoan) return res.status(404).json({ message: "Loan not found" });

    res.status(200).json({
      message: "Loan updated successfully",
      loan: updatedLoan
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating loan", error: error.message });
  }
};

const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Loan ID is required" });
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    const deletedLoan = await Loan.findByIdAndDelete(id);
    if (!deletedLoan) return res.status(404).json({ message: "Loan not found" });

    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting loan", error: error.message });
  }
};

const getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).populate("user", "firstName lastName email");

    const result = loans.map(loan => {
      const balance = calculateSchedule(loan);
      return {
        ...loan.toObject(),
        computed: balance
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user loans", error: error.message });
  }
};

module.exports = {
  createLoan,
  getRemainingBalance,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  getUserLoans,
  processPayment
};
