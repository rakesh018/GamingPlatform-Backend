const { Queue } = require("bullmq");

const payoutQueue = new Queue("payouts", {
  connection: {
    host: "localhost",
    port: 6379,
    // Other optional parameters can be included here
    // password: 'your_password',
    // db: 0
  },
});

module.exports=payoutQueue;