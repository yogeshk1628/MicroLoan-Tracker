const express = require("express");
const {
  createLoan,
  getRemainingBalance,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  getUserLoans,
  processPayment, // Add this new controller function
} = require("../controllers/LoanController");
const { verifyToken, authorizedRoles } = require("../middleware/AuthMiddleware");

const router = express.Router();

// Create a loan (user)
router.post("/loans", verifyToken, authorizedRoles("user", "admin"), createLoan);

// Get user's loans
router.get("/user/loans", verifyToken, authorizedRoles("user", "admin"), getUserLoans);

// Get remaining balance (penalty calculations)
router.get("/loans/:loanId/remaining-balance", verifyToken, authorizedRoles("user", "admin"), getRemainingBalance);
router.post("/loans/:loanId/remaining-balance", verifyToken, authorizedRoles("user", "admin"), getRemainingBalance);

// Process payment (NEW ROUTE)
router.post("/loans/:loanId/process-payment", verifyToken, authorizedRoles("user", "admin"), processPayment);

// Get all loans (admin only)
router.get("/allloans", verifyToken, authorizedRoles("admin"), getLoans);

// Get single loan by ID (admin or the loan's user)
router.get("/loans/:id", verifyToken, getLoanById);

// Update loan (admin only)
router.put("/loans/:id", verifyToken, authorizedRoles("admin"), updateLoan);

// Delete loan (admin only)
router.delete("/loans/:id", verifyToken, authorizedRoles("admin"), deleteLoan);

module.exports = router;
