
const { getRemainingTime } = require("../routes/gameLogic/timer");

const validateBet = async (req, res, next) => {
  const { gameName, roundDuration, betAmount } = req.body;
  const parsedBetAmount = parseFloat(betAmount);
  const parsedRoundDuration = parseInt(roundDuration);
  if (getRemainingTime(gameName, parsedRoundDuration) <= 3) {
    //not allowing bets in the last 3 seconds to make sure no inconsistency occurs
    return res.status(400).json({ error: `TIME UP ERROR` });
  } else {
    next();
  }
};
module.exports = validateBet;

//This middleware is called after validating token from the bet requests
//This is responsible for not allowing the bets in the last 3 seconds to avoid any inconsitencies
