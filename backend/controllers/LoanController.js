const Loan = require("../models/LoanModel");

const createLoan = async (req, res) => {
  try {
    // Get the authenticated user's id and role
    const authenticatedUserId = req.user?.id;
    const role = req.user?.role;

    // Allow admin to specify userId in request, otherwise use their own id
    const requestedUserId = req.body.userId;
    const userId = role === "admin" && requestedUserId ? requestedUserId : authenticatedUserId;

    // Validate user ID
    if (!userId) {
      return res.status(401).json({
        message: "User authentication failed",
        error: "No user ID found"
      });
    }

    // Check if target user already has an active or pending loan
    const existingLoan = await Loan.findOne({ 
      user: userId, 
      status: { $in: ['pending', 'active'] } 
    });

    if (existingLoan) {
      return res.status(400).json({
        message: "User already has an active or pending loan",
        error: "Duplicate loan application"
      });
    }

    // Use terms provided in request, fallback to defaults if missing
    const loanAmount = req.body.loanAmount || 5000;
    const termDays = req.body.termDays || 60;
    const dailyPayment = req.body.dailyPayment || 100;
    const interestRate = req.body.interestRate || 20;

    // Create repayment schedule
    let repayments = [];
    for (let day = 1; day <= termDays; day++) {
      repayments.push({
        day,
        dueAmount: dailyPayment,
        paidAmount: 0,
        isPaid: false
      });
    }

    const newLoan = new Loan({
      user: userId,
      loanAmount,
      interestRate,
      termDays,
      dailyPayment,
      status: "pending",
      repayments
    });

    await newLoan.save();

    res.status(201).json({
      message: "Loan created successfully",
      loan: newLoan
    });
  } catch (error) {
    console.error("Create loan error:", error);
    res.status(500).json({
      message: "Error creating loan",
      error: error.message || "Internal server error"
    });
  }
};


const DAILY_PAYMENT = 100;
const PENALTY_RATE = 0.2; // 20% per day on missed amount

/*const calculatePenalties = async (req, res) => {
  try {
    const { loanId } = req.params;
    
    if (!loanId) {
      return res.status(400).json({ 
        message: "Loan ID is required" 
      });
    }

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ 
        message: "Loan not found" 
      });
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
    console.error("Calculate penalties error:", error);
    res.status(500).json({ 
      message: "Error calculating penalties", 
      error: error.message 
    });
  }
};*/

// const confirmRepayment = async (req, res) => {
//   try {
//     const { loanId, day, isPaid } = req.body;

//     // Validate input
//     if (!loanId || day === undefined || isPaid === undefined) {
//       return res.status(400).json({ 
//         message: "Missing required fields: loanId, day, isPaid" 
//       });
//     }

//     const loan = await Loan.findById(loanId);
//     if (!loan) {
//       return res.status(404).json({ 
//         message: "Loan not found" 
//       });
//     }

//     const repayment = loan.repayments.find(r => r.day === day);
//     if (!repayment) {
//       return res.status(404).json({ 
//         message: "Repayment day not found" 
//       });
//     }

//     if (isPaid) {
//       repayment.isPaid = true;
//       repayment.paidAmount = repayment.dueAmount;
      
//       // Check if all payments are completed
//       const allPaid = loan.repayments.every(r => r.isPaid);
//       if (allPaid) {
//         loan.status = "completed";
//       }
//     } else {
//       repayment.isPaid = false;
//       // Apply 20% penalty to unpaid amount
//       const penalty = repayment.dueAmount * 0.2;
//       repayment.dueAmount += penalty;

//       // Add unpaid amount to next day's due
//       const nextRepayment = loan.repayments.find(r => r.day === day + 1);
//       if (nextRepayment) {
//         nextRepayment.dueAmount += repayment.dueAmount; 
//       }
//     }

//     await loan.save();
//     res.json({ 
//       message: "Repayment updated successfully", 
//       loan 
//     });
//   } catch (error) {
//     console.error("Confirm repayment error:", error);
//     res.status(500).json({ 
//       message: "Error updating repayment", 
//       error: error.message 
//     });
//   }
// };

// Get Remaining Balance with penalties
const getRemainingBalance = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId).populate("user");

    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const today = new Date();
    let remainingBalance = 0;
    let carryForward = 0;
    const penaltyRate = 0.2; // 20% daily penalty
    const breakdown = [];

    for (const repayment of loan.repayments) {
      let due = repayment.dueAmount + carryForward;
      let paid = repayment.paidAmount || 0;
      let remaining = due - paid;

      if (remaining > 0 && !repayment.isPaid) {
        // Apply penalty on remaining
        const penalty = remaining * penaltyRate;
        remaining += penalty;
        carryForward = remaining; // carry forward to next day
      } else if (remaining <= 0) {
        // Overpayment reduces next day's due
        carryForward = remaining; // can be negative
        remaining = 0;
      } else {
        carryForward = 0;
      }

      remainingBalance += remaining;

      breakdown.push({
        day: repayment.day,
        dueAmount: due,
        paidAmount: paid,
        penaltyApplied: remaining > 0 ? (due - paid) * penaltyRate : 0,
        isPaid: repayment.isPaid,
        carryForward: carryForward,
        remainingAfterDay: remainingBalance
      });
    }

    return res.status(200).json({
      loanId: loan._id,
      borrower: `${loan.user.firstName} ${loan.user.lastName}`,
      totalRemaining: remainingBalance,
      breakdown
    });
  } catch (error) {
    console.error("Error calculating remaining balance:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
    console.error("Get loans error:", error);
    res.status(500).json({ 
      message: "Error fetching loans", 
      error: error.message 
    });
  }
};

// Get single loan by ID
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "Loan ID is required" 
      });
    }

    const loan = await Loan.findById(id).populate("user", "firstName lastName email");
    if (!loan) {
      return res.status(404).json({ 
        message: "Loan not found" 
      });
    }

    // Check if user has permission to view this loan
    if (req.user.role !== 'admin' && loan.user._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Access denied" 
      });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error("Get loan by ID error:", error);
    res.status(500).json({ 
      message: "Error fetching loan", 
      error: error.message 
    });
  }
};

// Update loan details (admin only)
const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "Loan ID is required" 
      });
    }

    // Only admin can update loan details
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Access denied. Admin role required." 
      });
    }

    const updatedLoan = await Loan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedLoan) {
      return res.status(404).json({ 
        message: "Loan not found" 
      });
    }

    res.status(200).json({ 
      message: "Loan updated successfully", 
      loan: updatedLoan 
    });
  } catch (error) {
    console.error("Update loan error:", error);
    res.status(500).json({ 
      message: "Error updating loan", 
      error: error.message 
    });
  }
};

// Delete a loan (admin only)
const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        message: "Loan ID is required" 
      });
    }

    // Only admin can delete loans
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Access denied. Admin role required." 
      });
    }

    const deletedLoan = await Loan.findByIdAndDelete(id);
    if (!deletedLoan) {
      return res.status(404).json({ 
        message: "Loan not found" 
      });
    }

    res.status(200).json({ 
      message: "Loan deleted successfully" 
    });
  } catch (error) {
    console.error("Delete loan error:", error);
    res.status(500).json({ 
      message: "Error deleting loan", 
      error: error.message 
    });
  }
};

const getUserLoans = async (req, res) => {
  try {
    console.log("Getting loans for user:", req.user.id);
    
    // Get loans for the authenticated user only
    const loans = await Loan.find({ user: req.user.id }).populate("user", "firstName lastName email");
    
    console.log("Found loans:", loans.length);
    
    res.status(200).json(loans);
  } catch (error) {
    console.error("Get user loans error:", error);
    res.status(500).json({ 
      message: "Error fetching user loans", 
      error: error.message 
    });
  }
};

// const calculatePenalties = async (req, res) => {
//   try {
//     const { loanId } = req.params;
    
//     const loan = await Loan.findById(loanId).populate('user');
//     if (!loan) {
//       return res.status(404).json({ message: "Loan not found" });
//     }

//     const currentDate = new Date();
//     const penaltyRate = 0.05; // 5% per day penalty rate
//     let totalPenalty = 0;
//     let daysOverdue = 0;
//     const penaltyDetails = [];

//     if (loan.repayments && loan.repayments.length > 0) {
//       loan.repayments.forEach((repayment, index) => {
//         if (!repayment.isPaid) {
//           // Calculate days overdue for this payment
//           const dueDate = new Date(loan.createdAt);
//           dueDate.setDate(dueDate.getDate() + repayment.day);
          
//           if (currentDate > dueDate) {
//             const daysLate = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));
//             const penaltyAmount = repayment.dueAmount * (penaltyRate / 100) * daysLate;
            
//             totalPenalty += penaltyAmount;
//             daysOverdue = Math.max(daysOverdue, daysLate);
            
//             penaltyDetails.push({
//               day: repayment.day,
//               dueAmount: repayment.dueAmount,
//               daysLate: daysLate,
//               penalty: penaltyAmount
//             });
//           }
//         }
//       });
//     }

//     res.status(200).json({
//       loanId: loan._id,
//       borrower: `${loan.user.firstName} ${loan.user.lastName}`,
//       totalPenalty: totalPenalty,
//       daysOverdue: daysOverdue,
//       penaltyRate: penaltyRate,
//       details: penaltyDetails
//     });
//   } catch (error) {
//     console.error("Error calculating penalties:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


module.exports = { 
  createLoan, 
  getRemainingBalance, 
  getLoans, 
  getLoanById, 
  updateLoan, 
  deleteLoan,
  getUserLoans
};
