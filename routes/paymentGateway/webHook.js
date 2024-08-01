const mongoose = require("../../models/db");
const User = require("../../models/userModels");
const AutoDeposit = require("../../models/autoDeposit");
const notificationsQueue = require("../../workers/notificationsQueue");

const webHook = async (req, res) => {
  // {
  //     order_id,status,remarks are received on this route by payment gateway upon successful payment
  // }
  const { order_id, status, remark1 } = req.body;
  //Update the AutoDeposit as completed and increasing the balance of the user
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //Update status of AutoDeposit
    const updatedAutoDeposit = await AutoDeposit.findByIdAndUpdate(
      order_id,
      { status: "completed" },
      { new: true, session }
    );
    if (!updatedAutoDeposit) {
      throw new Error(
        JSON.stringify({ message: "COULD NOT UPDATE AUTO DEPOSIT" })
      );
    }
    //Update balance of user
    const updatedUser = await User.findByIdAndUpdate(
      updatedAutoDeposit.userId,
      { $inc: { balance: updatedAutoDeposit.amount } },
      { new: true, session }
    );
    if (!updatedUser) {
      throw new Error(
        JSON.stringify({ message: `COULD NOT UPDATE BALANCE OF THE USER` })
      );
    }

    await session.commitTransaction();
    session.endSession();

    //Trigger notification
    const notificationPayload = {
      userId: updatedAutoDeposit.userId,
      notificationType: "deposit",
      purpose: "successful",
      amount: parseFloat(updatedAutoDeposit.amount),
      message:`Deposit request of ${updatedAutoDeposit.amount} was successful`
    };
    await notificationsQueue.add("notification",notificationPayload);
    
    res.status(200).json({
      message: `Webhook received successfully and user details updated`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    }
    console.error(`Error occured processing webhook for order : ${order_id}`);
    res.status(400).json({ message: `Issue with webhook` });
  }
};

module.exports = webHook;
