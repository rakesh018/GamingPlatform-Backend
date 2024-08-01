const ManualDeposit = require("../../../models/manualDeposit");
const getAllManualDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    const paginatedManualDeposits = await ManualDeposit.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId amount status createdAt");

    const groupByStatusPipeline = [
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }, // Count the number of documents in each group
        },
      },
      {
        $project: {
          status: "$_id",
          totalAmount: 1,
          count: 1, // Include the count field
          _id: 0, // Exclude the _id field
        },
      },
    ];
    const groupByStatusData = await ManualDeposit.aggregate(
      groupByStatusPipeline
    );
    //if there are no entries for any status type, we add them here
    //also we calculate total amount from all kind of statuses
    let segregatedManualDeposits = {
      completed: { count: 0, totalAmount: 0 },
      pending: { count: 0, totalAmount: 0 },
      total: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
    };
    groupByStatusData.forEach((i) => {
      segregatedManualDeposits[i.status].count += i.count;
      segregatedManualDeposits[i.status].totalAmount += i.totalAmount;
      segregatedManualDeposits.total.count += i.count;
      segregatedManualDeposits.total.totalAmount += i.totalAmount;
    });

    res.status(200).json({
      paginatedManualDeposits,
      segregatedManualDeposits,
      currentPage: page,
      totalPages: Math.ceil(segregatedManualDeposits.total.count / limit),
    });
  } catch (error) {
    let parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    console.error(
      `Error occured during fetching all users for admin : `,
      error
    );
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};
module.exports = getAllManualDeposits;
