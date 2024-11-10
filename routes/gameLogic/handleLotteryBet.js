const redisClient = require("../../configs/redisClient");
const User = require("../../models/userModels");
const Bet = require("../../models/betModel");

const handleLotteryBet = async (req, betAmount) => {
  const userId = req.userId;
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Find the user with a session
    const user = await User.findById(userId).session(session);
    if (!user) {
      return { status: 404, payload: { error: "User not found" } };
    }
    if (betAmount !== 100) {
      return { status: 400, payload: { error: "Amount can only be 100" } };
    }
    // Check total balance (balance + withdrawableBalance)
    const totalBalance = user.balance + user.withdrawableBalance;
    if (totalBalance < betAmount) {
      return { status: 400, payload: { error: "Insufficient balance" } };
    }
    let gameId = await redisClient.get("lotteryId");
    if(!gameId){
      return {status:400,payload:{error:"Error buying lottery"}};
    }
    gameId = JSON.parse(gameId);
    // Deduct from withdrawableBalance first, then from balance if needed
    let remainingAmount = betAmount;
    if (user.withdrawableBalance >= remainingAmount) {
      user.withdrawableBalance -= remainingAmount;
      remainingAmount = 0;
    } else {
      remainingAmount -= user.withdrawableBalance;
      user.withdrawableBalance = 0;
      user.balance -= remainingAmount;
    }

    // Save the user with the updated balances within the transaction
    await user.save({ session });

    //create an entry in bets table
    let filledSlots = await redisClient.get("lotteriesBought");
    filledSlots = JSON.parse(filledSlots);
    filledSlots = filledSlots + 1; //increase bought slots number
    await redisClient.set("lotteriesBought", JSON.stringify(filledSlots));

    //handle agent system
    let handledBy = "admin";
    // const fetchedUser = await User.findOne({ _id: userId });
    if (user.nearestAgentId !== null) {
      const agent = await User.findOne({ _id: user.nearestAgentId });
      if (!agent.isRestricted && agent.balance >= 0) {
        //he is now accountable for his referees

        //we assume everyone is initially lost so agent incur profit (80%)
        let toBeAdded = 0.8 * betAmount;
        toBeAdded = parseFloat(toBeAdded.toFixed(1));
        agent.withdrawableBalance += toBeAdded;
        await agent.save({session});

        handledBy = agent._id;
      }
    }
    const newBet = new Bet({
      userId,
      gameId,
      gameType: "lottery",
      roundDuration: 1440,
      betAmount,
      choice: filledSlots,
      isWin: false,
      betStatus: "pending",
      handledBy,
    }); // isWIn and winning amount will be updated when results are declared
    const savedBet = await newBet.save({ session });
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    return {
      status: 200,
      payload: {
        updatedBalance: user.balance + user.withdrawableBalance,
        message: "Received 100 on lottery game",
        yourLottery:filledSlots
      },
    };
    // res.status(200).json({
    //   updatedBalance: user.balance + user.withdrawableBalance,
    //   message: `Received ${betAmount} on ${gameName} for round ${roundDuration}`,
    // });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return { status: 500, payload: { error: "INTERNAL SERVER ERROR" } };
  }
};
module.exports = handleLotteryBet;
