const redisClient = require("../configs/redisClient");
const Game = require("../models/gameModel");

const startLottery = async () => {
    try {
      const newGame = new Game({ gameType: "lottery", roundDuration: 1440 });
      const savedGame = await newGame.save();
      
      if (savedGame) {
        // Calculate the time remaining until 1 AM the next day
        const now = new Date();
        const next1AM = new Date();
        next1AM.setDate(now.getDate() + 1);
        next1AM.setHours(1, 0, 0, 0); // Set to 1:00 AM the next day
  
        const secondsUntil1AM = Math.floor((next1AM - now) / 1000); // Calculate in seconds
  
        // Set the game ID and lotteries bought with expiration time
        await redisClient.set("lotteryId", JSON.stringify(savedGame._id));
        await redisClient.expire("lotteryId", secondsUntil1AM+300);
  
        await redisClient.set("lotteriesBought", JSON.stringify(0));
        await redisClient.expire("lotteriesBought", secondsUntil1AM+300);
      }
    } catch (error) {
      console.error('Error starting lottery:', error);
    }
  };

  module.exports=startLottery;