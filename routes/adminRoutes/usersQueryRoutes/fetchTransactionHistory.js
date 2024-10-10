const mongoose = require('../../../models/db');
const AutoDeposit = require('../../../models/autoDeposit');
const ManualDeposit = require('../../../models/manualDeposit');
const Withdrawal = require('../../../models/withdrawal'); // Assuming you have a Withdrawal model

const getTransactionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(process.env.PAGE_LIMIT);
    const {uid}=req.body;
    if(!uid){
        throw new Error(JSON.stringify({status:400, message:"Invalid User ID"}));
    }
    // Define pagination parameters
    const skip = (page - 1) * limit;

    // Fetch AutoDeposits
    const autoDeposits = await AutoDeposit.aggregate([
      { $match: { uid, /*status: "completed"*/ } },
      { $sort: { createdAt: -1 } },
      { $project: { type: {$literal:"Deposit"}, amount: 1, createdAt: 1 ,status:1} },
    ]).exec();

    // Fetch Manual Deposits
    const manualDeposits = await ManualDeposit.aggregate([
      { $match: { uid, /*status: "completed"*/ } },
      { $sort: { createdAt: -1 } },
      { $project: { type: { $literal: "Deposit" }, amount: 1, createdAt: 1 ,status:1} },
    ]).exec();

    // Fetch Withdrawals
    const withdrawals = await Withdrawal.aggregate([
      { $match: { uid, /*status: "completed"*/ } },
      { $sort: { createdAt: -1 } },
      { $project: { type: { $literal: "Withdrawal" }, amount: 1, createdAt: 1 ,status:1} },
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
