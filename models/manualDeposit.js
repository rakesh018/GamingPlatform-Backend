const mongoose = require("./db");
const User = require("./userModels");
const manualDepositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uid:{type:String},
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

// Pre-save hook to populate uid from the User model
manualDepositSchema.pre("save", async function (next) {
  if (!this.uid) {
    try {
      const user = await User.findById(this.userId);
      if (user) {
        this.uid = user.uid;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("ManualDeposit", manualDepositSchema);
