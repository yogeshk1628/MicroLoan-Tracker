const express = require("express");
const {
  createLoan,
  getRemainingBalance,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  getUserLoans,
} = require("../controllers/LoanController");
const { verifyToken, authorizedRoles } = require("../middleware/AuthMiddleware");

const router = express.Router();

// Create a loan (user)
router.post("/loans", verifyToken, authorizedRoles("user", "admin"), createLoan);

router.get("/user/loans", verifyToken, authorizedRoles("user", "admin"), getUserLoans);

//router.get("/:loanId/penalty", verifyToken, authorizedRoles("user", "admin"), calculatePenalties);
router.get("/loans/:loanId/remaining-balance", verifyToken, authorizedRoles("user", "admin"), getRemainingBalance);

// Get all loans (admin only)
router.get("/allloans", verifyToken, authorizedRoles("admin"), getLoans);
//router.get("/allloans", verifyToken, getLoans);
//router.post("/loans/confirm-repayment", verifyToken, authorizedRoles("admin"), confirmRepayment);


// Get single loan by ID (admin or the loan's user)
router.get("/:id", verifyToken, getLoanById);

// Update loan (admin only)
router.put("/:id", verifyToken, authorizedRoles("admin"), updateLoan);

// Delete loan (admin only)
router.delete("/:id", verifyToken, authorizedRoles("admin"), deleteLoan);

module.exports = router;
