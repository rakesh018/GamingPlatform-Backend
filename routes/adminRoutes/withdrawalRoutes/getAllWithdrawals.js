const Withdrawal = require("../../../models/withdrawal");

const getAllWithdrawals = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(process.env.PAGE_LIMIT) || 10; // Ensure limit is a number

    // Get paginated withdrawals
    const paginatedWithdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId uid amount status bankName accountNumber ifscCode createdAt");

    // Aggregation pipeline for grouping by status
    const groupByStatusPipeline = [
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ];

    const groupByStatusData = await Withdrawal.aggregate(groupByStatusPipeline);

    // Default segregatedWithdrawals structure
    let segregatedWithdrawals = {
      completed: { count: 0, totalAmount: 0 },
      pending: { count: 0, totalAmount: 0 },
      total: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
    };

    // Update segregatedWithdrawals based on aggregation result
    groupByStatusData.forEach((i) => {
      if (segregatedWithdrawals[i.status]) {
        segregatedWithdrawals[i.status].count += i.count;
        segregatedWithdrawals[i.status].totalAmount += i.totalAmount;
      }
      // Update the total count and totalAmount
      segregatedWithdrawals.total.count += i.count;
      segregatedWithdrawals.total.totalAmount += i.totalAmount;
    });

    res.status(200).json({
      paginatedWithdrawals,
      segregatedWithdrawals,
      currentPage: page,
      totalPages: Math.ceil(segregatedWithdrawals.total.count / limit),
    });
  } catch (error) {
    console.error(
      `Error occurred during fetching all withdrawals for admin: `,
      error
    );
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};

module.exports = getAllWithdrawals;
