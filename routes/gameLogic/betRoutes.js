//It is a http route
const express = require("express");
const validateToken = require("../../middlewares/tokenMiddleware");
const validateBet = require("../../middlewares/betMiddleware");
const router = express.Router();
const activeBets = require("./activeBetsQueues");
const { gameTimers } = require("./timer");
const User = require("../../models/userModels");
const { Result } = require("express-validator");

router.post(
  "/makeBet",
  validateToken,
  /*validateBet,*/ async (req, res) => {
    let { gameName, roundDuration, betAmount, betChoice } = req.body;
    const userId = req.userId; //from token validation
    const mappedChoice = mapChoice(gameName, betChoice);
    betAmount = parseFloat(betAmount);
    const queue = activeBets[gameName][roundDuration];
    const round = gameTimers[gameName].find(
      (r) => r.duration === roundDuration
    );
    round[`betAmount${mappedChoice}`] += (betAmount);
    // Add the bet to the respective queue
    try {
      const newUser = await User.findOneAndUpdate(
        //this operation is atomic
        { _id: req.userId, balance: { $gt: betAmount }},
        { $inc:{balance:-betAmount} },
        { new: true }
      );
      if (!newUser) {
        throw new Error(JSON.stringify({status:400,message:`INVALID BALANCE ERROR`}));
      }
      await queue.add("bet", { betAmount, mappedChoice, userId });
      res.status(200).json({
        message: `Received ${betAmount} on ${gameName} for round ${roundDuration}`,
      });
    } catch (error) {
      const parsedError=JSON.parse(error.message);
      res.status(parsedError.status).json(parsedError.message);
    }
  }
);

const mapChoice = (gameName, betChoice) => {
  //Maps head to 1 , tail to 0 and up to 1 and down to 0
  if (gameName === `coinFlip`) {
    return betChoice === "head" ? 1 : 0;
  } else {
    return betChoice === "up" ? 1 : 0;
  }
};

module.exports = router;