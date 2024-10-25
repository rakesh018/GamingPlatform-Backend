const Bet = require("../../../models/betModel");

const getPaginatedUsersWithBets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(process.env.PAGE_LIMIT) || 10;
    const filterType = req.query.filterType;

    // Set up date filter based on query
    let dateFilter = {};
    switch (filterType) {
      case "1d":
        dateFilter = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
        break;
      case "1w":
        dateFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case "1m":
        dateFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = { $gte: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000) }; // All-time, kept a filter of year 
    }

    // Aggregate betting data
    const aggregatedBets = await Bet.aggregate([
      {
        $match: {
          createdAt: dateFilter,
        },
      },
      {
        $group: {
          _id: "$userId",
          uid: { $first: "$uid" }, // Include the uid field
          totalBetAmount: { $sum: "$betAmount" },
          totalProfit: {
            $sum: {
              $cond: [
                "$isWin",
                { $subtract: ["$winningAmount", "$betAmount"] },
                0,
              ],
            },
          },
          totalLoss: {
            $sum: {
              $cond: ["$isWin", 0, "$betAmount"],
            },
          },
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const uniqueUserIds = await Bet.distinct("userId", {
      createdAt: dateFilter,
    });
    const totalUsersWithBets = uniqueUserIds.length;
    res.status(200).json({
      paginatedUsersWithBets: aggregatedBets,
      totalUsersWithBets,
      currentPage: page,
      totalPages: Math.ceil(totalUsersWithBets / limit),
    });
  } catch (error) {
    console.error("Error occurred during fetching users with bets:", error);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};

module.exports = getPaginatedUsersWithBets;
