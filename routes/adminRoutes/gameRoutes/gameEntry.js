const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const { gameTimers } = require("../../gameLogic/timer");
const validateBet = require("../../../middlewares/betMiddleware"); // to verify the time remaining > 3 seconds
const validateAdminToken = require("../../../middlewares/validateAdminToken");

// Validation middleware
const validateChangeGameResult = [
  body("gameName")
    .exists()
    .withMessage("Game name is required")
    .isString()
    .isIn(["coinFlip", "stockTrader"])
    .withMessage("Game name must be either 'coinFlip' or 'stockTrader'."),
  body("roundDuration")
    .exists()
    .withMessage("Round duration is required")
    .isInt({ min: 1, max: 10 })
    .custom((value) => [1, 3, 5, 10].includes(value))
    .withMessage(
      "Round duration must be one of the following values: 1, 3, 5, 10."
    ),
  body("modifiedResult").exists().withMessage("Modified result value is required")
    .isInt({ min: 0, max: 1 })
    .withMessage("Modified result must be either 0 or 1."),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }
  next();
};

router.post(
  "/change-game-result",
  validateChangeGameResult,
  handleValidationErrors,
  validateAdminToken,
  validateBet,
  async (req, res) => {
    try {
      const { gameName, roundDuration, modifiedResult } = req.body;
      const round = gameTimers[gameName].find(
        (r) => r.duration === roundDuration
      );
      round.result = modifiedResult;
      res.status(200).json({
        message: `Result modified successfully.`,
        gameName,
        roundDuration,
        modifiedResult,
      });
    } catch (error) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (e) {
        parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
      }
      console.error("Error occurred during modifying game result: ", error);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

module.exports = router;
