const Bet = require("../../models/betModel");

const fetchReferees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    // First aggregation to count distinct userId entries
    const totalUsers = await Bet.aggregate([
      { $match: { handledBy: req.agentId } },
      { $group: { _id: "$userId" } }, // Group by userId to get distinct user count
      { $count: "total" } // Count unique userId entries
    ]);

    const totalDocuments = totalUsers.length > 0 ? totalUsers[0].total : 0; // Total distinct users
    const totalPages = Math.ceil(totalDocuments / limit);

    // Main aggregation with pagination
    const refereeStats = await Bet.aggregate([
      { $match: { handledBy: req.agentId } },
      {
        $group: {
          _id: { userId: "$userId", uid: "$uid" },
          totalBets: { $sum: 1 },
          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$isWin", true] },
                { $multiply: [{ $toDouble: "$betAmount" }, -1] },
                { $multiply: [{ $toDouble: "$betAmount" }, 0.8] }
              ]
            }
          }
        }
      },
      {
        $project: {
          userId: "$_id.userId",
          uid: "$_id.uid",
          totalBets: 1,
          totalIncome: { $round: ["$totalIncome", 1] },
          _id: 0
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    res.status(200).json({
      currentPage: page,
      totalPages,
      refereeStats
    });
  } catch (error) {
    console.error("Error fetching referees statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = fetchReferees;
