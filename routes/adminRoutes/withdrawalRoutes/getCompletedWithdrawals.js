const Withdrawal = require("../../../models/withdrawal");

const getCompletedWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    // Fetch paginated auto Withdrawals with status 'completed'
    const paginatedWithdrawals = await Withdrawal.find({
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId uid amount status bankName accountNumber ifscCode createdAt");

    // Count total documents with status 'completed' and sum their amounts
    const totalWithdrawals = await Withdrawal.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCount = totalWithdrawals.length > 0 ? totalWithdrawals[0].count : 0;
    const totalAmount =
      totalWithdrawals.length > 0 ? totalWithdrawals[0].totalAmount : 0;

    res.status(200).json({
      paginatedWithdrawals,
      completed: { count: totalCount, totalAmount: totalAmount },
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    let parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    console.error(
      `Error occurred during fetching completed Withdrawals:`,
      error
    );
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getCompletedWithdrawals;
