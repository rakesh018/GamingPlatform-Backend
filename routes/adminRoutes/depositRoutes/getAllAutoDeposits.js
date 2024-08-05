const AutoDeposit = require("../../../models/autoDeposit");
const getAllAutoDeposits = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    const paginatedAutoDeposits = await AutoDeposit.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("userId uid amount status createdAt");

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
    const groupByStatusData = await AutoDeposit.aggregate(
      groupByStatusPipeline
    );
    //if there are no entries for any status type, we add them here
    //also we calculate total amount from all kind of statuses
    let segregatedAutoDeposits = {
      completed: { count: 0, totalAmount: 0 },
      pending: { count: 0, totalAmount: 0 },
      total: { count: 0, totalAmount: 0 },
      rejected: { count: 0, totalAmount: 0 },
    };
    groupByStatusData.forEach((i) => {
      segregatedAutoDeposits[i.status].count += i.count;
      segregatedAutoDeposits[i.status].totalAmount += i.totalAmount;
      segregatedAutoDeposits.total.count += i.count;
      segregatedAutoDeposits.total.totalAmount += i.totalAmount;
    });

    res.status(200).json({
      paginatedAutoDeposits,
      segregatedAutoDeposits,
      currentPage: page,
      totalPages: Math.ceil(segregatedAutoDeposits.total.count / limit),
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
module.exports = getAllAutoDeposits;
