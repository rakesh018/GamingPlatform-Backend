const express = require("express");
const router = express.Router();
const ManualDeposit = require("../../../models/manualDeposit");
const User = require("../../../models/userModels");
const notificationsQueue = require("../../../workers/notificationsQueue");
const mongoose = require("../../../models/db");
const { body, validationResult } = require("express-validator");
const s3 = require("../../../configs/awsConfig");

// Middleware to validate request body
const validateRequest = [
  body("depositId").isMongoId().withMessage("Invalid deposit ID"),
  body("verifiedAmount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Verified amount must be a positive number"),
];

router.post("/mark-completed", validateRequest, async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }

  const { depositId, verifiedAmount } = req.body; //verifiedAmount is optional by client

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and update deposit
    const savedManualDeposit = await ManualDeposit.findById(depositId).session(
      session
    );
    if (!savedManualDeposit) {
      throw new Error(
        JSON.stringify({ status: 400, message: "INVALID DEPOSIT ID" })
      );
    }
    if (savedManualDeposit.status === "completed") {
      throw new Error(
        JSON.stringify({ status: 400, message: "Deposit is already completed" })
      );
    } else if (savedManualDeposit.status === "rejected") {
      throw new Error(
        JSON.stringify({ status: 400, message: "Deposit was rejected." })
      );
    }

    // Mark deposit as completed
    savedManualDeposit.status = "completed";
    await savedManualDeposit.save({ session });

    // Add balance to user
    const depositedAmount = verifiedAmount || savedManualDeposit.amount;
    const newUser = await User.findOneAndUpdate(
      { _id: savedManualDeposit.userId },
      { $inc: { balance: depositedAmount } },
      { new: true, session }
    );

    // Process referral
    if (!newUser.firstDepositMade && newUser.referredBy) {
      //if user has not made a deposit and has been referred by someone
      const referrer = await User.findById(newUser.referredBy).session(session);
      referrer.withdrawableBalance +=
        referrer.referralCommission * 0.01 * depositedAmount;
      await referrer.save({ session });

      //mark first deposit made as true
      newUser.firstDepositMade = true;
      await newUser.save({ session });

      // Trigger notification for referrer
      const referrerNotificationPayload = {
        userId: referrer._id,
        notificationType: "referral",
        purpose: "successful",
        amount: parseFloat(depositedAmount),
        message: `Debited with ${
          depositedAmount * 0.01 * referrer.referralCommission
        } as referral bonus`,
      };
      await notificationsQueue.add("notification", referrerNotificationPayload);
    }

    // Trigger notification for user
    const notificationPayload = {
      userId: newUser._id,
      notificationType: "deposit",
      purpose: "successful",
      amount: depositedAmount,
      message: `Deposit request of ${depositedAmount} was successful`,
    };
    await notificationsQueue.add("notification", notificationPayload);

    // Delete image from S3
    if (savedManualDeposit.s3Key) {
      const s3Params = {
        Bucket: process.env.AWS_BUCKET,
        Key: savedManualDeposit.s3Key,
      };
      await s3.deleteObject(s3Params).promise();
    }
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Deposit marked as completed successfully",
      userId: newUser._id,
      status: "completed",
      amount: depositedAmount,
      createdAt:savedManualDeposit.createdAt,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    console.error(`Error during marking manual deposit as completed: ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
});

module.exports = router;
