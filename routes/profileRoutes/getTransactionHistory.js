const mongoose = require('../../models/db');
const Transaction = require('../../models/transactionModel');
const ManualDeposit = require('../../models/manualDeposit');

const getTransactionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query?.page, 10) || 1;
    const limit = parseInt(process.env.PAGE_LIMIT, 10) || 10; // Ensure limit is an integer
    const userId = req.userId;

    // Define pagination parameters
    const skip = (page - 1) * limit;

    // Fetch transactions
    const transactions = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "completed" } },
      { $sort: { createdAt: -1 } },
      { $project: { type: 1, amount: 1, createdAt: 1 } },
    ]).exec();

    // Fetch manual deposits
    const manualDeposits = await ManualDeposit.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "verified" } },
      { $sort: { createdAt: -1 } },
      { $project: { type: { $literal: "manualDeposit" }, amount: 1, createdAt: 1 } },
    ]).exec();

    // Combine results
    const allTransactions = [...transactions, ...manualDeposits];

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
    console.error(`ERROR FETCHING USER TRANSACTION HISTORY : ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getTransactionHistory;
