const { body, validationResult } = require("express-validator");
const ManualDeposit = require("../../models/manualDeposit"); // Replace with the actual path
const notificationsQueue = require("../../workers/notificationsQueue");

const saveManualDepositKey = [
  // Validation middleware
  body("key").notEmpty().withMessage("Key is required"),
  body("amount")
    .isFloat({ min: 1, max: 100000 })
    .withMessage("Amount must be between 1 and 100000"),
  body("utr").notEmpty().withMessage("UTR/Transaction ID is required"),

  // Error handling middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },

  // Main handler
  async (req, res) => {
    try {
      const { key, amount,utr} = req.body;
      const userId = req.userId;

      const newManualDeposit = new ManualDeposit({
        userId: userId,
        s3Key: key,
        utr:utr,
        amount: amount, // By default it is pending and will be reviewed by admin
      });

      const savedManualDeposit = await newManualDeposit.save();

      if (!savedManualDeposit) {
        throw new Error(
          JSON.stringify({ status: 500, message: "ERROR SAVING TRANSACTION" })
        );
      }

      //Trigger a notification to notify about initiated of deposit
      await notificationsQueue.add("notification", {
        userId,
        notificationType: "deposit",
        purpose: "initiated",
        amount: parseFloat(amount),
        message:`Deposit of ${amount} initiated`
      });
      res.status(200).json({ message: "PAYMENT PROOF UPLOADED SUCCESSFULLY" });
    } catch (error) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (e) {
        parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
      }
      console.error(`Error saving manual deposit: ${error}`);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  },
];

module.exports = saveManualDepositKey;
