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
      default:null, //after getting confirmation from frontend, we can update this field
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ManualDeposit = mongoose.model("ManualDeposit", manualDepositSchema);

module.exports = ManualDeposit;
