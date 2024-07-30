const redisClient = require("../configs/redisClient");
const Bet = require("../models/betModel");

async function computeAllTimeLeaderboard() {
    try {
      // Aggregate total winnings by user
      const leaderboard = await Bet.aggregate([
        {
          $group: {
            _id: "$userId",
            totalWinnings: { $sum: "$winningAmount" }
          }
        },
        {
          $sort: { totalWinnings: -1 }
        },
        {
          $limit: 20
        },
        {
          $project: {
            _id: 0,        // Exclude _id from output
            userId: "$_id", // Rename _id to userId
            totalWinnings: 1 // Include totalWinnings
          }
        }
      ]);
  
      return leaderboard;
    } catch (error) {
      console.error("Error computing leaderboard:", error);
      return [];
    }
  }

async function computeDailyLeaderboard() {
  try {
    const now = new Date();
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Aggregate total winnings by user for the past 24 hours
    const leaderboard = await Bet.aggregate([
      {
        $match: {
          createdAt: { $gte: past24Hours }, // Filter bets from the past 24 hours
        },
      },
      {
        $group: {
          _id: "$userId",
          totalWinnings: { $sum: "$winningAmount" },
        },
      },
      {
        $sort: { totalWinnings: -1 }, // Sort by total winnings in descending order
      },
      {
        $limit: 20, // Limit to top 20 users
      },
      {
        $project: {
          _id: 0, // Exclude _id from output
          userId: "$_id", // Rename _id to userId
          totalWinnings: 1, // Include totalWinnings
        },
      },
    ]);

    return leaderboard;
  } catch (error) {
    console.error("Error computing daily leaderboard:", error);
    return [];
  }
}

const updateAllTimeLeaderboard = async () => {
  // Logic to compute all-time leaderboard data
  const allTimeLeaderboard = await computeAllTimeLeaderboard();

  // Cache the data in Redis without expiry
  redisClient.set("all-time-leaderboard", JSON.stringify(allTimeLeaderboard));
};

const updateDailyLeaderboard = async () => {
  // Logic to compute past 24 hours leaderboard data
  const dailyLeaderboard = await computeDailyLeaderboard();

  // Cache the data in Redis without expiry
  redisClient.set("daily-leaderboard", JSON.stringify(dailyLeaderboard));
};

const getCachedLeaderboard = async (type) => {
  try {
    // Get the data from Redis
    let data = await redisClient.get(type);

    if (data) {
      return JSON.parse(data); // Return the parsed data if found
    }

    // Data not found, update cache
    if (type === "all-time-leaderboard") {
      await updateAllTimeLeaderboard();
    } else if (type === "daily-leaderboard") {
      await updateDailyLeaderboard();
    } else {
      return []; // If the type is not recognized
    }
    data = await redisClient.get(type);
    if (data) {
      return JSON.parse(data);
    } else {
      return []; // Return an empty array if data is still not found
    }
  } catch (error) {
    console.error(`Error fetching or updating ${type}:`, error);
    return [];
  }
};

module.exports = {updateAllTimeLeaderboard,updateDailyLeaderboard,getCachedLeaderboard};
