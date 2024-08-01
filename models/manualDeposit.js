const mongoose = require("./db");
const User = require("./userModels");
const manualDepositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
      default: null, //after getting confirmation from frontend, we can update this field
    },
    utr: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "rejected"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ManualDeposit", manualDepositSchema);
