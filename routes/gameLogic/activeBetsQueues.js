const { Queue } = require('bullmq');
const redisConfig=require('../../configs/redisConfig')

// Function to create a queue
const createQueue = (name) => new Queue(name, {
  connection: redisConfig
});

// Map to hold queues for each game and round duration
const activeBets = {
  coinFlip: {
    1: createQueue('coinFlip-1'),
    3: createQueue('coinFlip-3'),
    5: createQueue('coinFlip-5'),
    10: createQueue('coinFlip-10')
  },
  stockTrader: {
    1: createQueue('stockTrader-1'),
    3: createQueue('stockTrader-3'),
    5: createQueue('stockTrader-5'),
    10: createQueue('stockTrader-10')
  }
};
module.exports=activeBets;