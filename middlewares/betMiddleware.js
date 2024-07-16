const User = require("../models/userModels");
const { getRemainingTime } = require("../routes/gameLogic/timer");

const validateBet = async (req, res, next) => {
  const userDetails = await User.findById(req.userId); //userId attached by token middleware
  const { gameName, roundDuration, betAmount } = req.body;
  const parsedBetAmount = parseFloat(betAmount);
  const parsedRoundDuration = parseInt(roundDuration);

  if (parsedBetAmount > userDetails.balance) {
    return res.status(400).json({ error: `INSUFFICIENT BALANCE ERROR` });
  } else if (getRemainingTime(gameName, parsedRoundDuration) <= 3) {
    //not allowing bets in the last 3 seconds to make sure no inconsistency occurs
    return res.status(400).json({ error: `TIME UP ERROR` });
  } else {
    //decreasing user balance
    const user = await User.findOneAndUpdate( //this operation is atomic
      { _id: req.userId },
      { $inc: { balance: -parsedBetAmount } },
      { new: true }
    );
    next();
  }
};
module.exports = validateBet;

//This middleware is called after validating token from the bet requests
//This is responsible for validating the bet amount by checking if balance is enough
