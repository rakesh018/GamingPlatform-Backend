const AutoDeposit = require("../../../models/autoDeposit");

const getPendingAutoDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    // Fetch paginated auto deposits with status 'pending'
    const paginatedAutoDeposits = await AutoDeposit.find({
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId uid amount status createdAt");

    // Count total documents with status 'pending' and sum their amounts
    const totalDeposits = await AutoDeposit.aggregate([
      { $match: { status: "pending" } },
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
      pending: { count: totalCount, totalAmount: totalAmount },
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

module.exports = getPendingAutoDeposits;
