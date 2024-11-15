const mongoose = require("./db");
const User = require("./userModels");
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User },
    uid:{type:String},
    notificationType: {
      type: String,
      required: true,
      enum: ["deposit", "withdrawal", "promotion", "referral"],
    },
    hasSeen: { type: Boolean, required: true, default: false },
    purpose: {
      type: String,
      required: true,
      enum: ["successful", "failed", "initiated"],
    },
    amount: { type: Number, default: 0 },
    message:{type:String,required:true}
  },
  {
    timestamps: true,
  }
);
// Pre-save hook to populate uid from the User model
notificationSchema.pre("save", async function (next) {
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
module.exports = mongoose.model("Notification", notificationSchema);
