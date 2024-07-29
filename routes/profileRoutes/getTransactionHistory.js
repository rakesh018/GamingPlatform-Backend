const mongoose = require('../../models/db');
const AutoDeposit = require('../../models/autoDeposit');
const ManualDeposit = require('../../models/manualDeposit');
const Withdrawal = require('../../models/withdrawal'); // Assuming you have a Withdrawal model

const getTransactionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query?.page, 10) || 1;
    const limit = parseInt(process.env.PAGE_LIMIT, 10) || 10; // Ensure limit is an integer
    const userId = req.userId;

    // Define pagination parameters
    const skip = (page - 1) * limit;

    // Fetch AutoDeposits
    const autoDeposits = await AutoDeposit.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), /*status: "completed"*/ } },
      { $sort: { createdAt: -1 } },
      { $project: { type: {$literal:"autoDeposit"}, amount: 1, createdAt: 1 ,status:1} },
    ]).exec();

    // Fetch Manual Deposits
    const manualDeposits = await ManualDeposit.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), /*status: "completed"*/ } },
      { $sort: { createdAt: -1 } },
      { $project: { type: { $literal: "manualDeposit" }, amount: 1, createdAt: 1 ,status:1} },
    ]).exec();

    // Fetch Withdrawals
    const withdrawals = await Withdrawal.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), /*status: "completed"*/ } },
      { $sort: { createdAt: -1 } },
      { $project: { type: { $literal: "withdrawal" }, amount: 1, createdAt: 1 ,status:1} },
    ]).exec();

    // Combine results
    const allTransactions = [...autoDeposits, ...manualDeposits, ...withdrawals];

    // Sort combined results
    allTransactions.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate results
    const paginatedTransactions = allTransactions.slice(
      skip,
      skip + limit
    );

    res.status(200).json({
      paginatedTransactions,
      totalTransactions: allTransactions.length,
      currentPage: page,
      totalPages: Math.ceil(allTransactions.length / limit),
    });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: `ERROR FETCHING USER TRANSACTION HISTORY` };
    }
    console.error(`ERROR FETCHING USER TRANSACTION HISTORY: ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getTransactionHistory;
