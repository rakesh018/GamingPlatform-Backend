const mongoose = require("./db");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, /*unique: true,*/ required: true },
    uid: { type: String, unique: true, required: true },
    isVerified: { type: Boolean, default: false }, //if otp is verfied yet or not
    isRestricted: { type: Boolean, default: false }, //if admin restricted this account or not
    balance: { type: Number, default: 0 }, //this cannot be withdrawn
    withdrawableBalance: { type: Number, default: 0 }, //can be withdrawn
    referralCode: { type: String, required: true, unique: true },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "User",
    }, //refers to User table itself and is null if user does not provide referal code during registration
    referralCommission: {
      type: Number,
      min: 1.0,
      max: 100.0,
      required: true,
      default: 5,
    }, //5% is common for all
    firstDepositMade: { type: Boolean, default: false }, //can be used to track referral
    userType: {
      type: String,
      required: true,
      enum: ["regular", "demo", "agent"],
      default: "regular",
    },
    nearestAgentId:{type:String,default:null}
  },
  {
    timestamps: true, //store createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model("User", userSchema);
