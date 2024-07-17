const mongoose = require("../../models/db");
const User = require("../../models/userModels");
const Transaction = require("../../models/transactionModel");

const webHook = async (req, res) => {
  // {
  //     order_id,status,remarks are received on this route by payment gateway upon successful payment
  // }
  const { order_id, status, remark1 } = req.body;
  //Update the transaction as completed and increasing the balance of the user
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //Update status of transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      order_id,
      { status: "completed" },
      { new: true, session }
    );
    if (!updatedTransaction) {
      throw new Error(
        JSON.stringify({ message: "COULD NOT UPDATE TRANSACTION" })
      );
    }
    //Update balance of user
    const updatedUser = await User.findByIdAndUpdate(
      updatedTransaction.userId,
      { $inc: { balance: updatedTransaction.amount } },
      { new: true, session }
    );
    if (!updatedUser) {
      throw new Error(
        JSON.stringify({ message: `COULD NOT UPDATE BALANCE OF THE USER` })
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: `Webhook received successfully and user details updated`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error occured processing webhook for order : ${order_id}`);
    res.status(400).json({messge:`Issue with webhook`});
  }
};

module.exports = webHook;
