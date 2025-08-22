const express = require("express");
const {
  createLoan,
  getRemainingBalance,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  getUserLoans,
  processPayment,
} = require("../controllers/LoanController");
const { verifyToken, authorizedRoles } = require("../middleware/AuthMiddleware");

const router = express.Router();

/**
 * Create a loan (user or admin on behalf of user)
 * Body: { loanAmount?, termDays?, dailyPayment?, interestRate?, userId?(admin only) }
 */
router.post("/loans", verifyToken, authorizedRoles("user", "admin"), createLoan);

/**
 * Get loans for the authenticated user
 */
router.get("/user/loans", verifyToken, authorizedRoles("user", "admin"), getUserLoans);

/**
 * Get current remaining balance snapshot for a loan
 * (also persists penaltyApplied/isPaid per day for UI display)
 */
router.get("/loans/:loanId/remaining-balance", verifyToken, authorizedRoles("user", "admin"), getRemainingBalance);

// Optional POST mirror to support UI refresh actions via POST
router.post("/loans/:loanId/remaining-balance", verifyToken, authorizedRoles("user", "admin"), getRemainingBalance);

/**
 * Process a payment for a specific day
 * Body: { day: number, amount: number }
 */
router.post("/loans/:loanId/process-payment", verifyToken, authorizedRoles("user", "admin"), processPayment);

/**
 * Admin: list all loans, with optional filters via query:
 *   ?status=pending|active|closed
 *   ?userId=<id>
 */
router.get("/allloans", verifyToken, authorizedRoles("admin"), getLoans);

/**
 * Get single loan by ID
 * Controller enforces owner-or-admin access
 */
router.get("/loans/:id", verifyToken, getLoanById);

/**
 * Admin: update a loan
 */
router.put("/loans/:id", verifyToken, authorizedRoles("admin"), updateLoan);

/**
 * Admin: delete a loan
 */
router.delete("/loans/:id", verifyToken, authorizedRoles("admin"), deleteLoan);

module.exports = router;
