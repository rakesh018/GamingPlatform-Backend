const cron = require("node-cron");
const cleanupAWS  = require("./awsCleanupService");

// Schedule the cron job to run daily at midnight
const scheduleAWSCleanup = async () => {
  // Schedule the cron job to run daily at midnight
  cron.schedule("0 2 * * *", async () => {
    console.log("Running AWS cleanup...");
    cleanupAWS()
      .then(() => {
        console.log("Cleanup job completed");
      })
      .catch((err) => {
        console.error("Error running cleanup job:", err);
      });
  });
};
module.exports = scheduleAWSCleanup;
