const mongoose = require("mongoose");

const repaymentSchema = new mongoose.Schema({
  day: Number, // day number in term (1 to 60)
  dueAmount: { type: Number, default: 100 }, // default daily repayment
  paidAmount: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  date: { type: Date }
});

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
    repayments: [repaymentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
