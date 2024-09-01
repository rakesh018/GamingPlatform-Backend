const User = require("../../../models/userModels");
const ManualDeposit = require("../../../models/manualDeposit");
const Withdrawal = require("../../../models/withdrawal");
const mongoose = require("../../../models/db");
const Notification=require('../../../models/notificationModel');

const getParticularUserDetails = async (req, res) => {
  try {
    const userId = req.params?.userId; // can query using both _id and uid of user
    if (!userId) {
      throw new Error(
        JSON.stringify({ status: 404, message: `INVALID USERID` })
      );
    }

    // Check if the userId is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

    // Fetch user by _id or uid
    const getUser = await User.findOne({
      $or: [...(isValidObjectId ? [{ _id: userId }] : []), { uid: userId }],
    });
    if (!getUser) {
      throw new Error(
        JSON.stringify({ status: 400, message: `INVALID USER ID` })
      );
    }
    //referral count
    const referralCount=await Notification.countDocuments({userId,notificationType:"referral"});

    // Fetch total deposits and total withdrawals for the user
    const [totalDeposits, totalWithdrawals] = await Promise.all([
      ManualDeposit.aggregate([
        { $match: { uid: getUser.uid, status: "completed" } },
        { $group: { _id: null, totalDeposits: { $sum: "$amount" } } },
      ]),
      Withdrawal.aggregate([
        { $match: { uid: getUser.uid, status: "completed" } },
        { $group: { _id: null, totalWithdrawals: { $sum: "$amount" } } },
      ]),
    ]);

    const totalDepositAmount =
      totalDeposits.length > 0 ? totalDeposits[0].totalDeposits : 0;
    const totalWithdrawalAmount =
      totalWithdrawals.length > 0 ? totalWithdrawals[0].totalWithdrawals : 0;

    // Return user details along with total deposits and withdrawals
    res.status(200).json({
      message: `User details fetched successfully.`,
      user: getUser,
      referralCount,
      totalDeposits: totalDepositAmount,
      totalWithdrawals: totalWithdrawalAmount,
    });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: `ERROR FETCHING USER DETAILS` };
    }
    console.error(`ERROR FETCHING USER DETAILS : ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getParticularUserDetails;
