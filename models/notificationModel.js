const mongoose = require("./db");
const User = require("./userModels");
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User },
    notificationType: {
      type: String,
      required: true,
      enum: ["deposit", "withdrawal", "promotion", "referral"],
    },
    hasSeen: { type: Boolean, required: true, default: false },
    purpose: { type: String, required: true, enum: ["success", "failure"] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
