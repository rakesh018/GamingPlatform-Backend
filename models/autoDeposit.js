const mongoose = require("./db");
const User = require("./userModels");
const autoDepositSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User },
    uid: { type: String }, //populated using pre save hook
    amount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "rejected"],
      default: "pending",
    },
    phoneNumber: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to populate uid from the User model
autoDepositSchema.pre("save", async function (next) {
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
module.exports = mongoose.model("AutoDeposit", autoDepositSchema);
