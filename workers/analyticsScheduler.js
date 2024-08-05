const cron = require("node-cron");
const {
  updateAnnualAnalytics,
  updateMonthlyAnalytics,
} = require("./analyticsService");

const scheduleLeaderboardUpdates = () => {
  cron.schedule("0 1 1 * *", async () => {
    console.log("Annual analytics updated");
    await updateAnnualAnalytics();
  });

  
  cron.schedule("30 1 * * *", async () => {
    console.log(`Monthly analytics updated`);
    await updateMonthlyAnalytics();
  });
};

module.exports = scheduleLeaderboardUpdates;
