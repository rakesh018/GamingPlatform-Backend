const express = require("express");
const validateToken = require("../../middlewares/tokenMiddleware");
const validateBet = require("../../middlewares/betMiddleware");
const router = express.Router();
const activeBets = require("./activeBetsQueues");
const { gameTimers } = require("./timer");
const User = require("../../models/userModels");
const redisClient = require("../../configs/redisClient");
const otpGenerator = require("otp-generator");
const { body, validationResult } = require("express-validator");

router.post(
  "/makeBet",
  validateToken,
  [
    body("gameName")
      .notEmpty()
      .withMessage("Game name is required")
      .isIn(["stockTrader", "coinFlip"])
      .withMessage("Invalid game name"),
    body("roundDuration")
      .notEmpty()
      .withMessage("Round duration is required")
      .isIn([1, 3, 5, 10])
      .withMessage("Invalid round duration"),
    body("betAmount")
      .notEmpty()
      .withMessage("Bet amount is required")
      .isFloat({ gt: 9 })
      .withMessage("Bet amount must be a positive number"),
    body("betChoice")
      .notEmpty()
      .withMessage("Bet choice is required")
      .isIn(["head", "tail", "up", "down"])
      .withMessage("Invalid bet choice"),
  ],
  validateBet,
  async (req, res) => {
    //error management
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0].msg });
    }

    let { gameName, roundDuration, betAmount, betChoice } = req.body;
    const userId = req.userId; // from token validation
    const mappedChoice = mapChoice(gameName, betChoice);
    betAmount = parseFloat(betAmount);
    const queue = activeBets[gameName][roundDuration];
    const round = gameTimers[gameName].find(
      (r) => r.duration === roundDuration
    );
    if (req.isDemo === false) {
      //not considering demo user bets into regular flow
      round[`betAmount${mappedChoice}`] += betAmount;
    }

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

      // Add the bet to the respective queue
      await queue.add("bet", { betAmount, mappedChoice, userId });

      //cache bet slip
      await cacheBetSlip(
        userId,
        gameName,
        roundDuration,
        betAmount,
        mappedChoice,
        req.remainingTime
      );
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({
        updatedBalance: user.balance + user.withdrawableBalance,
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
      console.error(error);
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
const cacheBetSlip = async (
  userId,
  gameName,
  roundDuration,
  betAmount,
  mappedChoice,
  remainingTime
) => {
  const uniqueId = otpGenerator.generate(5, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  const key = `betSlips:${userId}:${uniqueId}`;
  const payload = { gameName, roundDuration, betAmount, mappedChoice };
  await redisClient.set(key, JSON.stringify(payload));
  await redisClient.expire(key, remainingTime);
};

router.get("/get-bet-slips", validateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const pattern = `betSlips:${userId}:*`;
    // Fetch all keys matching the pattern
    const keys = await redisClient.keys(pattern);

    // Fetch all bet data and TTL information
    const betPromises = keys.map(async (key) => {
      const [data, ttl] = await Promise.all([
        redisClient.get(key),
        redisClient.ttl(key),
      ]);
      return { data: JSON.parse(data), ttl };
    });

    // Resolve all promises
    const betsWithTTL = await Promise.all(betPromises);

    // Prepare response with bet data and TTL
    const bets = betsWithTTL.map(({ data, ttl }) => ({
      ...data,
      ttl,
    }));

    res.status(200).json({ bets });
  } catch (error) {
    console.error("Error retrieving live bets:", error);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});
router.get("/get-rounds-history/:gameName/:roundDuration", validateToken, async (req, res) => {
  try {
    const {gameName,roundDuration}=req.params;
    if (!gameName || !roundDuration) {
      res.json({ parsedResults: [] });
    }
    const key = `roundResults:${gameName}:${roundDuration}`;

    // Retrieve the latest 10 results from the list
    const results = await redisClient.lRange(key, 0, 10);

    // Parse the results from JSON
    const parsedResults = results.map((result) => JSON.parse(result));

    res.status(200).json({ parsedResults });
  } catch (error) {
    res.json({ parsedResults: [] });
  }
});
module.exports = router;
