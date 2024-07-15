const { Queue } = require("bullmq");
const redisConfig = require("../../configs/redisConfig");

const payoutQueue = new Queue("payouts", {
  connection: redisConfig
});

module.exports=payoutQueue;