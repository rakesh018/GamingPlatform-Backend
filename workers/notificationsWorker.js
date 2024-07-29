const { Worker } = require("bullmq");
const redisConfig = require("../configs/redisConfig");
const Notification = require("../models/notificationModel");

const processPayoutJob = async (job) => {
  const { userId, notificationType, purpose, amount } = job.data;
  const newNotification = new Notification({
    userId,
    notificationType,
    purpose,
    amount,
  });
  await newNotification.save();
};

// Create a Worker for the payout queue
const notificationsWorker = new Worker("notifications", processPayoutJob, {
  connection: redisConfig,
  removeOnComplete: { count: 0 }, //deletes all completed jobs once they are done
});

// notificationsWorker.on("completed", (job) => {
//   console.log(`Job with id ${job.id} has been completed`);
// });

notificationsWorker.on("failed", (job, err) => {
  console.log(`Job with id ${job.id} has failed with ${err.message}`);
});

console.log(`Notification worker started running`); //to confirm whether worker is running or not
