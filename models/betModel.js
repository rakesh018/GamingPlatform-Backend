const mongoose = require("./db");
const Game = require("./gameModel");
const User = require("./userModels");
const otpGenerator = require('otp-generator'); // Ensure otpGenerator is installed

const betSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User },
    uid: { type: String },  // This will store the user's UID
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: Game },
    gameType: { type: String, required: true },
    roundDuration: { type: Number, required: true },
    betAmount: { type: Number, required: true },
    choice: { type: Number, required: true },
    isWin: { type: Boolean, required: true },
    winningAmount: { type: Number, default: 0 },
    betCode: { type: String, unique: true }  // Unique code for each bet
  },
  { timestamps: true }
);

// Function to generate a 8-digit alphanumeric code
const generateUID = () => {
  return otpGenerator.generate(8, {
    digits: true,
    upperCaseAlphabets: true,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

// Function to check the uniqueness of betCode
async function generateUniqueBetCode() {
  let uniqueCode = generateUID();
  let bet = await mongoose.model("Bet").findOne({ betCode: uniqueCode });

  // Keep generating a new code until it is unique
  while (bet) {
    uniqueCode = generateUID();
    bet = await mongoose.model("Bet").findOne({ betCode: uniqueCode });
  }

  return uniqueCode;
}

// Pre-save hook to populate uid from the User model and generate unique betCode
betSchema.pre("save", async function (next) {
  // Populate UID from the User model
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

  // Generate unique betCode if it doesn't exist
  if (!this.betCode) {
    try {
      this.betCode = await generateUniqueBetCode();
    } catch (error) {
      return next(error); // Pass error to next middleware if something goes wrong
    }
  }

  next();
});

module.exports = mongoose.model("Bet", betSchema);
