const mongoose = require("./db");
const Game = require("./gameModel");
const User = require("./userModels");

const betSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: User },
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: Game },
    gameType:{type:String,required:true},
    roundDuration:{type:Number,required:true},
    betAmount: { type: Number, required: true },
    choice: { type: Number, required: true },
    isWin: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bet", betSchema);
