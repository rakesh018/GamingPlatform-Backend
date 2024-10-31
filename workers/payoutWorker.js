const { Worker } = require("bullmq");
const Bet = require("../models/betModel");
const User = require("../models/userModels");
const redisConfig = require("../configs/redisConfig");

// Define the payout processing function
const processPayoutJob = async (job) => {
  const { gameId, userId, choice, result, betAmount, gameName, roundDuration } =
    job.data;
  //      string  string    int   int        num     string    string

  //update user balance (only if he wins else no) and make an entry in bets table
  let winnings = 0;
  if (choice === result) {
    //win situation so update user balance
    //as it is winning amount update in withdrawable amount
    await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { withdrawableBalance: process.env.ODDS * betAmount } }
    );
    winnings = process.env.ODDS * betAmount;
  }
  //handle agent system
  let handledBy="admin";
  const fetchedUser = await User.findOne({ _id:userId });
  if (fetchedUser.nearestAgentId!==null) {
    const agent = await User.findOne({ _id: fetchedUser.nearestAgentId });
    if (!agent.isRestricted && agent.balance >= 0) {
      //he is now accountable for his referees
      if (choice === result) {
        //referee won so agent incur loss(100%)
        agent.balance -= betAmount;
        if (agent.balance < 0) {
          agent.isRestricted = true;
          //he will be shadow banned 
        }
        await agent.save();
      } else {
        //referee lost so agent incur profit (80%)
        let toBeAdded=(0.8*betAmount);
        toBeAdded=parseFloat(toBeAdded.toFixed(1));
        agent.withdrawableBalance += toBeAdded;
        await agent.save();
      }
      handledBy=agent._id;
    }
  }
  //make a new entry in bets database
  const newBet = new Bet({
    userId,
    gameId,
    gameType: gameName,
    roundDuration: parseInt(roundDuration),
    betAmount,
    choice,
    isWin: Boolean(choice === result),
    winningAmount: winnings,
    handledBy
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
