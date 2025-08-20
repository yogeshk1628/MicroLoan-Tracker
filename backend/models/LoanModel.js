const mongoose = require("mongoose");


const loanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    loanAmount: {
      type: Number,
      default: 5000
    },
    interestRate: {
      type: Number,
      default: 20 // percent
    },
    termDays: {
      type: Number,
      default: 60
    },
    dailyPayment: {
      type: Number,
      default: 100
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "completed"],
      default: "pending"
    },
    repayments: [{
    day: { type: Number, required: true },
    dueAmount: { type: Number, required: true, default: 100 },
    paidAmount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    penaltyAmount: { type: Number, default: 0 }, // Store penalty for this day
    createdAt: { type: Date, default: Date.now }
  }],
  totalPenalties: { type: Number, default: 0 },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
