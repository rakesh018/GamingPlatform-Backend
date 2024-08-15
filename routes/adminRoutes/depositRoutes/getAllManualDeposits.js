const ManualDeposit = require("../../../models/manualDeposit");

const getAllManualDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(process.env.PAGE_LIMIT) || 10; // Ensure limit is a number

    const paginatedManualDeposits = await ManualDeposit.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId uid amount status isCleanedUp createdAt");

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

    const groupByStatusData = await ManualDeposit.aggregate(groupByStatusPipeline);

    // Initialize segregatedManualDeposits with default values
    let segregatedManualDeposits = {
      completed: { count: 0, totalAmount: 0 },
      pending: { count: 0, totalAmount: 0 },
      total: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
    };

    groupByStatusData.forEach((item) => {
      const status = item.status || 'unknown'; // Default to 'unknown' if status is undefined
      if (segregatedManualDeposits[status] !== undefined) {
        segregatedManualDeposits[status].count += item.count || 0;
        segregatedManualDeposits[status].totalAmount += item.totalAmount || 0;
        segregatedManualDeposits.total.count += item.count || 0;
        segregatedManualDeposits.total.totalAmount += item.totalAmount || 0;
      }
    });

    res.status(200).json({
      paginatedManualDeposits,
      segregatedManualDeposits,
      currentPage: page,
      totalPages: Math.ceil(segregatedManualDeposits.total.count / limit),
    });
  } catch (error) {
    let parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    console.error(`Error occurred during fetching all manual deposits:`, error);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getAllManualDeposits;
