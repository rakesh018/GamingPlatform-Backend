const cron = require("node-cron");
const {
  updateAnnualAnalytics,
  updateMonthlyAnalytics,
} = require("./analyticsService");

const scheduleAnalyticsUpdates = () => {
  cron.schedule("45 1 * * *", async () => {
    await updateAnnualAnalytics();
    console.log("Annual analytics updated");
  });

  
  cron.schedule("30 1 * * *", async () => {
    await updateMonthlyAnalytics();
    console.log(`Monthly analytics updated`);
  });
};

module.exports = scheduleAnalyticsUpdates;
