const mongoose = require("../../models/db");
const User = require("../../models/userModels");
const Withdrawal = require("../../models/withdrawal");
const notificationsQueue = require("../../workers/notificationsQueue");

const withdrawalRequest = async (req, res) => {
  const userId = req.userId;
  const { amount, bankName, accountNumber, ifscCode } = req.body;

  // Start a session and Withdrawal
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Attempt to decrement withdrawableBalance atomically
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        withdrawableBalance: { $gte: amount }, // Ensure sufficient balance
      },
      {
        $inc: { withdrawableBalance: -amount },
      },
      { new: true, session } // Return the updated document and use session
    );

    if (!user) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "USER NOT FOUND OR INVALID BALANCE",
        })
      );
    }

    // Create a new Withdrawal entry
    const newWithdrawal = new Withdrawal({
      userId: user._id,
      amount,
      bankName,
      accountNumber,
      ifscCode,
    });

    // Save the Withdrawal
    await newWithdrawal.save({ session });

    // Commit the Withdrawal
    await session.commitTransaction();
    session.endSession();

    //Trigger a notification
    const notificationPayload = {
      userId: userId,
      notificationType: "withdrawal",
      purpose: "initiated",
      amount: amount,
    };
    await notificationsQueue.add("notification", notificationPayload);
    res.status(200).json({
      message: "Withdrawal request generated successfully",
      updatedBalance: user.withdrawableBalance + user.balance,
    });
  } catch (error) {
    // Abort the Withdrawal and end the session
    await session.abortTransaction();
    session.endSession();

    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    console.error(
      `Error occurred during creating withdrawal request: ${error}`
    );
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = withdrawalRequest;
