const redisClient = require("../configs/redisClient");
const Game = require("../models/gameModel");
const Bet = require("../models/betModel");
const User = require("../models/userModels");
const LotteryResult = require("../models/lotteryResult");

const declareLotteryResult = async () => {
  try {
    let gameId = "";
    let totalLotteries = await redisClient.get("lotteriesBought");
    await redisClient.expire("lotteryId", 200000); //wantedly keeping a large number to know that it is under result declaration

    const fetchedLottery = await Game.findOne({
      gameType: "lottery",
      result: 2,
    });
    if(fetchedLottery){
      gameId = fetchedLottery._id;
      fetchedLottery.result = 0; //placeholder itself
      await fetchedLottery.save();
      await generateResult(totalLotteries, gameId);
    }
  } catch (error) {
    console.error(`Error declaring lottery result : ${error}`)
  }
};

const generateResult = async (totalLotteries, gameId) => {
  let resultArray = [];
  let roundedHundred = Math.round(totalLotteries / 100) * 100;
  if (roundedHundred === 0) {
    roundedHundred = 100;
  }
  if (totalLotteries >= 10) {
    //declare first winner
    const firstWinner = randomBetweenOneAnd(roundedHundred);
    resultArray.push(firstWinner);
  }
  if (totalLotteries >= 30) {
    //2nd winner
    const secondWinner = randomBetweenOneAnd(roundedHundred);
    resultArray.push(secondWinner);
  }
  if (totalLotteries >= 100) {
    //3rd winner
    const thirdWinner = randomBetweenOneAnd(roundedHundred);
    resultArray.push(thirdWinner);
  }
  const newLotteryResult = new LotteryResult({
    gameType: "lottery",
    gameId,
    totalLotteriesSold: totalLotteries,
    result: resultArray,
  });
  await newLotteryResult.save();
  let prizesArray = [1000, 2000, 7000];
  await Bet.updateMany({ gameId }, { betStatus: "completed" }); //they are kept pending
  for (let i = 0; i < resultArray.length; i++) {
    await showResultInDatabase(resultArray[i], prizesArray[i], gameId);
  }
};
function randomBetweenOneAnd(num) {
  return Math.floor(Math.random() * num) + 1;
}

const showResultInDatabase = async (ticket, price, gameId) => {
  //first find who bought that ticket
  //then increase his balance with price
  //if there is an agent also associate him
  const savedBet = await Bet.findOne({ gameId, choice: ticket });
  if (savedBet) {
    savedBet.isWin = true;
    savedBet.winningAmount = price;
    await savedBet.save();
    const userId = savedBet.userId;
    //increase his balance
    const user = await User.findOne({ _id: userId });
    user.withdrawableBalance += price;
    await user.save();
    if (user.nearestAgentId !== null) {
      const agent = await User.findOne({ _id: user.nearestAgentId });
      if (!agent.isRestricted && agent.balance >= 0) {
        //agent must incur loss this time
        agent.balance -= price;
        agent.balance -= 100; //we assumed all lost initially so remove that too
        if (agent.balance < 0) {
          agent.isRestricted = true;
        }
        await agent.save();
      }
    }
  }
};

module.exports = declareLotteryResult;
