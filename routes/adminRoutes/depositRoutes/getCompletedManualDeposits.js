const ManualDeposit = require("../../../models/manualDeposit");

const getCompletedManualDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    // Fetch paginated auto deposits with status 'completed'
    const paginatedManualDeposits = await ManualDeposit.find({
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId uid amount status isCleanedUp createdAt");

    // Count total documents with status 'completed' and sum their amounts
    const totalDeposits = await ManualDeposit.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalCount = totalDeposits.length > 0 ? totalDeposits[0].count : 0;
    const totalAmount =
      totalDeposits.length > 0 ? totalDeposits[0].totalAmount : 0;

    res.status(200).json({
      paginatedManualDeposits,
      completed: { count: totalCount, totalAmount: totalAmount },
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    let parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    console.error(
      `Error occurred during fetching completed auto deposits:`,
      error
    );
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getCompletedManualDeposits;
