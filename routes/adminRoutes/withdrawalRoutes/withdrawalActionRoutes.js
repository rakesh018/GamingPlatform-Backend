const express = require("express");
const router = express.Router();
const Withdrawal = require("../../../models/withdrawal");
const notificationsQueue = require("../../../workers/notificationsQueue");
const { body, validationResult } = require("express-validator");
const User=require('../../../models/userModels');
const mongoose=require('../../../models/db');

// Middleware to validate request body
const validateRequest = [
  body("withdrawalId").isMongoId().withMessage("Invalid withdrawal ID"),
];

router.post("/mark-completed", validateRequest, async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }

  const { withdrawalId } = req.body;

  try {
    // Find and update withdrawal
    const savedWithdrawal = await Withdrawal.findById(withdrawalId);
    if (!savedWithdrawal) {
      throw new Error(
        JSON.stringify({ status: 400, message: "INVALID WITHDRAWAL ID" })
      );
    }
    if (savedWithdrawal.status === "completed") {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Withdrawal is already completed",
        })
      );
    } else if (savedWithdrawal.status === "rejected") {
      throw new Error(
        JSON.stringify({ status: 400, message: "Withdrawal was rejected." })
      );
    }

    // Mark withdrawal as completed
    savedWithdrawal.status = "completed";
    await savedWithdrawal.save();
    const notificationPayload={
        userId:savedWithdrawal.userId,
        notificationType:"withdrawal",
        purpose:"successful",
        amount:savedWithdrawal.amount,
        message:`Withdrawal request of ${savedWithdrawal.amount} has been processed successfully`
    }

    await notificationsQueue.add("notification", notificationPayload);
    res.status(200).json({message:'Withdrawal marked successfully',savedWithdrawal});
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    console.error(`Error during marking withdrawal as completed: ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
});

router.post('/mark-rejected', validateRequest, async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0].msg });
    }
    /*
      {need withdrawalId}
     */
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { withdrawalId } = req.body;
      const savedWithdrawal = await Withdrawal.findOne({ _id: withdrawalId }).session(session).exec();
      if (!savedWithdrawal) {
        throw new Error(
          JSON.stringify({ status: 400, message: 'INVALID WITHDRAWAL ID' })
        );
      }
      if (savedWithdrawal.status === 'completed') {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: 'Withdrawal is already completed. Cannot mark rejected',
          })
        );
      } else if (savedWithdrawal.status === 'rejected') {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: 'Withdrawal was already rejected.',
          })
        );
      }
  
      // Save the status
      savedWithdrawal.status = 'rejected';
      await savedWithdrawal.save({ session });
  
      const amt = savedWithdrawal.amount;
  
      // Withdrawal is failed so add the amount back to user in withdrawable Wallet
      const updatedUser = await User.findOneAndUpdate(
        { _id: savedWithdrawal.userId },
        { $inc: { withdrawableBalance: amt } },
        { new: true, session }
      );
  
      // Notify user
      const notificationPayload = {
        userId: savedWithdrawal.userId,
        notificationType: 'withdrawal',
        purpose: 'failed',
        amount: savedWithdrawal.amount,
        message: `Withdrawal request of ${savedWithdrawal.amount} was rejected`,
      };

      await notificationsQueue.add('notification',notificationPayload);
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({
        message: 'Withdrawal marked rejected successfully',
        savedWithdrawal,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
  
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (e) {
        parsedError = { status: 500, message: 'INTERNAL SERVER ERROR' };
      }
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  });

module.exports = router;
