const { Queue } = require("bullmq");
const redisConfig = require("../configs/redisConfig");

const notificationsQueue = new Queue("notifications", {
  connection: redisConfig
});

module.exports=notificationsQueue;