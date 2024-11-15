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
const handleLotteryBet = require("./handleLotteryBet");
const Bet = require("../../models/betModel");

router.post(
  "/makeBet",
  validateToken,
  [
    body("gameName")
      .notEmpty()
      .withMessage("Game name is required")
      .isIn(["stockTrader", "coinFlip", "lottery"])
      .withMessage("Invalid game name"),
    body("roundDuration")
      .notEmpty()
      .withMessage("Round duration is required")
      .isIn([1, 3, 5, 10, 1440])
      .withMessage("Invalid round duration"),
    body("betAmount")
      .notEmpty()
      .withMessage("Bet amount is required")
      .isFloat()
      .withMessage("Invalid amount"),
    body("betChoice")
      .notEmpty()
      .withMessage("Bet choice is required")
      .isIn(["head", "tail", "up", "down", "random"])
      .withMessage("Invalid bet choice"),
  ],
  validateBet,
  async (req, res) => {
    //error management
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    let { gameName, roundDuration, betAmount, betChoice } = req.body;
    if (betAmount < 10) {
      return res.status(400).json("Minimum bet amount is 10");
    }
    if (betAmount > 300000) {
      return res.status(400).json("Maximum bet amount is 300000");
    }
    const userId = req.userId; // from token validation
    if (gameName === "lottery") {
      const output = await handleLotteryBet(req, betAmount);
      return res.status(output.status).json(output.payload);
    }
    const mappedChoice = mapChoice(gameName, betChoice);
    betAmount = parseFloat(betAmount);
    const queue = activeBets[gameName][roundDuration];
    const round = gameTimers[gameName].find(
      (r) => r.duration === roundDuration
    );

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
      if (req.isDemo === false) {
        //not considering demo user bets into regular flow
        round[`betAmount${mappedChoice}`] += betAmount;
      }
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
router.get(
  "/get-rounds-history/:gameName/:roundDuration",
  validateToken,
  async (req, res) => {
    try {
      const { gameName, roundDuration } = req.params;
      if (!gameName || !roundDuration) {
        res.json({ parsedResults: [] });
      }
      const key = `roundResults:${gameName}:${roundDuration}`;
      const candlestickKey = `candlestickData:${gameName}:${roundDuration}`;
      // Retrieve the latest 10 results from the list
      const results = await redisClient.lRange(key, 0, 9);
      const candlestickData = await redisClient.get(candlestickKey);
      // Parse the results from JSON
      const parsedResults = results.map((result) => JSON.parse(result));
      const parsedCandleStickData = JSON.parse(candlestickData);
      res.status(200).json({ parsedResults, parsedCandleStickData });
    } catch (error) {
      console.error(error);
      res.json({ parsedResults: [], parsedCandleStickData: [] });
    }
  }
);
router.get("/lottery-home", validateToken, async (req, res) => {
  try {
    //we will send current running slot starting number
    //also send past details of lottery
    const userId = req.userId;
    let currentSlot = await redisClient.get("lotteriesBought");
    currentSlot = JSON.parse(currentSlot);
    let nearestHundred = Math.floor(currentSlot / 100) * 100;
    nearestHundred = nearestHundred + 1;
    const ttl = await redisClient.ttl("lotteryId");
    let lotteryId = await redisClient.get("lotteryId");
    lotteryId = JSON.parse(lotteryId);

    const lotteryBets = await Bet.find({ userId, gameType: "lottery" })
      .sort({ createdAt: -1 }) // Sorts by `createdAt` in descending order
      .limit(5);
    
    const highlightedBets=await Bet.find({userId,gameType:"lottery",betStatus:"pending",choice:{$gte:nearestHundred,$lte:nearestHundred+99}}).select("choice");
    res.json({ liveSlot:nearestHundred, ttl, lotteryBets,highlightedBets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});
module.exports = router;
