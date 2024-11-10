const cron = require("node-cron");
const startLottery = require("./lotteryService");
const declareLotteryResult = require("./lotteryResult");

const scheduleLottery = async () => {
  // Schedule the cron job to run daily at midnight
  cron.schedule("7 1 * * *", async () => {
    await declareLotteryResult();
    console.log("Lottery game results declared");
    await startLottery();
    console.log("New Lottery game scheduled...");
  });
};
module.exports = scheduleLottery;
