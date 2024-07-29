const express = require("express");
const validateToken = require("../../middlewares/tokenMiddleware");
const validateBet = require("../../middlewares/betMiddleware");
const router = express.Router();
const activeBets = require("./activeBetsQueues");
const { gameTimers } = require("./timer");
const User = require("../../models/userModels");

router.post(
  "/makeBet",
  validateToken,
  /*validateBet,*/ async (req, res) => {
    let { gameName, roundDuration, betAmount, betChoice } = req.body;
    const userId = req.userId; // from token validation
    const mappedChoice = mapChoice(gameName, betChoice);
    betAmount = parseFloat(betAmount);
    const queue = activeBets[gameName][roundDuration];
    const round = gameTimers[gameName].find(
      (r) => r.duration === roundDuration
    );
    round[`betAmount${mappedChoice}`] += betAmount;

    // Start a session and transaction
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Find the user with a session
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error(
          JSON.stringify({ status: 404, message: "User not found" })
        );
      }

      // Check total balance (balance + withdrawableBalance)
      const totalBalance = user.balance + user.withdrawableBalance;
      if (totalBalance < betAmount) {
        throw new Error(
          JSON.stringify({ status: 400, message: "Insufficient balance" })
        );
      }

      // Deduct from withdrawableBalance first, then from balance if needed
      let remainingAmount = betAmount;
      if (user.withdrawableBalance >= remainingAmount) {
        user.withdrawableBalance -= remainingAmount;
        remainingAmount = 0;
      } else {
        remainingAmount -= user.withdrawableBalance;
        user.withdrawableBalance = 0;
        user.balance -= remainingAmount;
      }

      // Save the user with the updated balances within the transaction
      await user.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Add the bet to the respective queue
      await queue.add("bet", { betAmount, mappedChoice, userId });

      res.status(200).json({
        updatedBalance: user.balance+user.withdrawableBalance,
        message: `Received ${betAmount} on ${gameName} for round ${roundDuration}`,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (error) {
        parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
      }
      res.status(parsedError.status).json(parsedError.message);
    }
  }
);

const mapChoice = (gameName, betChoice) => {
  // Maps head to 1, tail to 0, and up to 1, and down to 0
  if (gameName === "coinFlip") {
    return betChoice === "head" ? 1 : 0;
  } else {
    return betChoice === "up" ? 1 : 0;
  }
};

module.exports = router;
