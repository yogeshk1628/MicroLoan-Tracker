const Loan = require("../models/LoanModel");

/**
 * Rounds to 2 decimals reliably.
 */
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Core balance calculator.
 *
 * Rules implemented:
 * - Base due per day is loan.dailyPayment (UI's "Due Amount").
 * - Penalty applies ONLY to the next day and is computed from the previous day's carry.
 * - penalty(dayN) = penaltyRate * carry(dayN-1).
 * - totalDue(dayN) = base + carry(dayN-1) + penalty(dayN).
 * - carry(dayN) = max(0, totalDue(dayN) - paid(dayN)).
 * - isPaid(dayN) is true if paid(dayN) >= totalDue(dayN) AT EVALUATION TIME.
 *
 * This calculator uses existing recorded payments per day. It does not look ahead,
 * and it does not apply penalties to multiple future days. Each day’s penalty
 * depends only on the immediate previous day’s carry as of current persisted payments.
 */
function calculateSchedule(loan, opts = {}) {
  const penaltyRate = opts.penaltyRate ?? 0.2;
  const base = loan.dailyPayment || 100;

  const repayments = loan.repayments || [];
  let breakdown = [];
  let totalPenalties = 0;
  let totalRemaining = 0;

  // carry from previous day (day-1)
  let prevCarry = 0;

  for (let i = 0; i < repayments.length; i++) {
    const r = repayments[i];
    const paid = r.paidAmount || 0;

    // Penalty is applied on the PREVIOUS day's carry only
    const penaltyApplied = round2(prevCarry > 0 ? prevCarry * penaltyRate : 0);

    // Today's total due = base + yesterday's carry + penalty on that carry
    const totalDueForDay = round2(base + prevCarry + penaltyApplied);

    // Unpaid (carry to next day) is what's left of today's total due after today's paid
    const unpaidAmount = round2(Math.max(0, totalDueForDay - paid));

    // Mark paid only if today's total due is fully covered
    const isPaid = paid >= totalDueForDay;

    breakdown.push({
      day: r.day,
      dueAmount: base,                       // Display column: "Due Amount"
      penaltyApplied,                        // Display column: "Penalty Applied"
      carryForwardFromPrevious: prevCarry,   // For debugging/inspection
      totalDueForDay,                        // Derived
      paidAmount: paid,                      // Display column: "Paid Amount"
      unpaidAmount,                          // For remaining and next day carry
      carryForward: unpaidAmount,            // Display column: "Carry Forward"
      isPaid                                  // Status
    });

    totalPenalties = round2(totalPenalties + penaltyApplied);
    totalRemaining = round2(totalRemaining + unpaidAmount);

    // Set carry for next iteration/day
    prevCarry = unpaidAmount;
  }

  return {
    loanId: loan._id,
    borrower: loan.user ? `${loan.user.firstName} ${loan.user.lastName}` : undefined,
    totalRemaining,
    totalPenalties,
    breakdown
  };
}

/**
 * Creates a new loan with default schedule.
 */
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

    const repayments = Array.from({ length: termDays }, (_, idx) => ({
      day: idx + 1,
      dueAmount: dailyPayment,  // base shown on UI
      paidAmount: 0,
      isPaid: false,
      penaltyAmount: 0          // stored for transparency after recompute
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

/**
 * Processes a payment for a specific day.
 *
 * Requirements satisfied:
 * - Only the next day's penalty is affected (because penalty depends on previous day's carry).
 * - When a payment is recorded for a day, we recompute the whole schedule and mark that day
 *   as Paid if and only if its total due is fully covered by its paidAmount at that time.
 * - We DO NOT distribute overpayment to future days automatically by default.
 *   If you want to roll over overpayment to future days, uncomment the "rollover" section.
 */
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

    // Increment local paid amount
    const prevPaid = loan.repayments[idx].paidAmount || 0;
    let newPaid = round2(prevPaid + amount);

    // Optional: roll over overpayment to subsequent days
    // Uncomment this block if overpayments should reduce future carries automatically.
    /*
    const snapshotForRollover = calculateSchedule({
      ...loan.toObject(),
      repayments: loan.repayments.map(r => ({ ...r }))
    });
    const todayBreak = snapshotForRollover.breakdown.find(b => b.day === Number(day));
    if (todayBreak) {
      const overpay = round2(Math.max(0, newPaid - todayBreak.totalDueForDay));
      if (overpay > 0) {
        newPaid = todayBreak.totalDueForDay; // cap today's paid at today's due
        // push overpay into next days sequentially
        for (let j = idx + 1, left = overpay; j < loan.repayments.length && left > 0; j++) {
          const tempLoan = {
            ...loan.toObject(),
            repayments: loan.repayments.map((r, k) =>
              k === idx ? { ...r, paidAmount: newPaid } : { ...r }
            )
          };
          const sched = calculateSchedule(tempLoan);
          const nextBreak = sched.breakdown.find(b => b.day === loan.repayments[j].day);
          if (!nextBreak) break;
          const dueNext = nextBreak.totalDueForDay;
          const alreadyPaidNext = loan.repayments[j].paidAmount || 0;
          const needed = round2(Math.max(0, dueNext - alreadyPaidNext));
          const payNow = Math.min(left, needed);
          loan.repayments[j].paidAmount = round2(alreadyPaidNext + payNow);
          left = round2(left - payNow);
        }
      }
    }
    */

    loan.repayments[idx].paidAmount = newPaid;
    loan.repayments[idx].paymentDate = new Date();

    // Recompute schedule after this transaction
    const balance = calculateSchedule(loan);

    // Sync penalty & isPaid flags back to loan
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
      updatedBalance: balance
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Returns remaining balance snapshot and persists penalty fields on the loan
 * so UI can display "Penalty Applied" and "Carry Forward" per day.
 */
const getRemainingBalance = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId).populate("user");
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const balance = calculateSchedule(loan);

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

    // Recompute (non-persistent here unless you want to persist as well)
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

    // Optionally recompute for each (without saving to DB here to keep it light)
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
