const express = require("express");
const {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan
} = require("../controllers/LoanController");
const { verifyToken, authorizedRoles } = require("../middleware/AuthMiddleware");

const router = express.Router();

// Create a loan (user)
router.post("/loans", verifyToken, authorizedRoles("user"), createLoan);

// Get all loans (admin only)
router.get("/allloans", verifyToken, authorizedRoles("admin"), getLoans);

// Get single loan by ID (admin or the loan's user)
router.get("/:id", verifyToken, getLoanById);

// Update loan (admin only)
router.put("/:id", verifyToken, authorizedRoles("admin"), updateLoan);

// Delete loan (admin only)
router.delete("/:id", verifyToken, authorizedRoles("admin"), deleteLoan);

module.exports = router;
