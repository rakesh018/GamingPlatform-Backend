const AutoDeposit = require("../../../models/autoDeposit");

const getCompletedAutoDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(process.env.PAGE_LIMIT) || 10;

    // Fetch paginated auto deposits with status 'completed'
    const paginatedAutoDeposits = await AutoDeposit.find({
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId amount status createdAt");

    // Count total documents with status 'completed' and sum their amounts
    const totalDeposits = await AutoDeposit.aggregate([
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
      paginatedAutoDeposits,
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

module.exports = getCompletedAutoDeposits;
