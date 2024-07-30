const { Worker } = require("bullmq");
const Bet = require("../models/betModel");
const User = require("../models/userModels");
const redisConfig = require("../configs/redisConfig");

// Define the payout processing function
const processPayoutJob = async (job) => {
  const { gameId, userId, choice, result, betAmount, gameName, roundDuration } =job.data;
  //      string  string    int   int        num     string    string

  //update user balance (only if he wins else no) and make an entry in bets table
  let winnings=0;
  if (choice === result) {
    //win situation so update user balance
    //as it is winning amount update in withdrawable amount 
    await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { withdrawableBalance: process.env.ODDS * betAmount } }
    );
    winnings=process.env.ODDS * betAmount;
  }
  //make a new entry in bets database
  const newBet = new Bet({
    userId,
    gameId,
    gameType:gameName,
    roundDuration:parseInt(roundDuration),
    betAmount,
    choice,
    isWin: Boolean(choice === result),
    winningAmount:winnings,
  });
  await newBet.save();
};

// Create a Worker for the payout queue
const payoutWorker = new Worker("payouts", processPayoutJob, {
  connection: redisConfig,
  removeOnComplete: { count: 0 }, //deletes all completed jobs once they are done
});

// payoutWorker.on("completed", (job) => {
//   console.log(`Job with id ${job.id} has been completed`);
// });

payoutWorker.on("failed", (job, err) => {
  console.log(`Job with id ${job.id} has failed with ${err.message}`);
});

console.log(`Payout worker started running`); //to confirm whether worker is running or not
