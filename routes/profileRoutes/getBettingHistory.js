const Bet = require("../../models/betModel");
const getBettingHistory = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    //Fetch partial data from database
    const paginatedBets = await Bet.find({userId:req.userId})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("gameType roundDuration betAmount isWin createdAt");

    if (!paginatedBets) {
      throw new Error(
        JSON.stringify({ status: 500, message: "ERROR FETCHING BETS1" })
      );
    }
    const totalBets = await Bet.countDocuments({ userId: req.userId });
    if (!totalBets) {
      throw new Error(
        JSON.stringify({ status: 500, message: "ERROR FETCHING BETS" })
      );
    }

    res.status(200).json({
      paginatedBets,
      totalBets,
      currentPage: page,
      totalPages: Math.ceil(totalBets / limit),
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
module.exports = getBettingHistory;
