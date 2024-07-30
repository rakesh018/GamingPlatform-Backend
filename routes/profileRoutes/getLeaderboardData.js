const {getCachedLeaderboard} = require("../../workers/leaderBoardService");
const getLeaderBoardData = async (req, res) => {
  try {
    const type = req.params.type;
    if (type != "all-time-leaderboard" && type != "daily-leaderboard") {
      throw new Error(
        JSON.stringify({ status: 400, message: `INVALID LEADERBOARD TYPE` })
      );
    }
    const leaderboardData = await getCachedLeaderboard(type);
    res
      .status(200)
      .json({ message: `${type} fetched successfully`, leaderboardData });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    }
    console.error(error);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};
module.exports = getLeaderBoardData;
