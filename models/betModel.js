const mongoose = require("./db");
const Game = require("./gameModel");
const User = require("./userModels");

const betSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User },
    uid:{type:String},
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: Game },
    gameType:{type:String,required:true},
    roundDuration:{type:Number,required:true},
    betAmount: { type: Number, required: true },
    choice: { type: Number, required: true },
    isWin: { type: Boolean, required: true },
    winningAmount:{type:Number,default:0}
  },
  { timestamps: true }
);

// Pre-save hook to populate uid from the User model
betSchema.pre("save", async function (next) {
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

module.exports = mongoose.model("Bet", betSchema);
