const cron = require("node-cron");
const {
  updateAllTimeLeaderboard,
  updateDailyLeaderboard,
} = require("./leaderBoardService");

const scheduleLeaderboardUpdates = async() => {
  // Schedule to update all-time leaderboard at 12 AM daily
  cron.schedule("0 0 * * *", async () => {
    console.log("All time leaderboard updated");
    await updateAllTimeLeaderboard();
  });

  // Schedule to update past 24 hrs leaderboard scheduleded for updates every hour at 30 minutes
  cron.schedule("30 * * * *", async () => {
    console.log(`Daily leaderboard updated`);
    await updateDailyLeaderboard();
  });
};

module.exports = scheduleLeaderboardUpdates;
