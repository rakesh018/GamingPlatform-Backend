const { registerRound } = require("./registerRound");
const calculateResult = require("./calculateResult");
const transferForPayout = require("./transferForPayout");
const io = require("../../index");
const redisClient = require("../../configs/redisClient");
const processTimers = async (io, gameTimers) => {
  for (const gameName in gameTimers) {
    for (
      let roundIndex = 0;
      roundIndex < gameTimers[gameName].length;
      roundIndex++
    ) {
      const timer = gameTimers[gameName][roundIndex];
      const roundDuration = timer.duration;
      if (timer.remainingTime <= 0) {
        io.emit("roundFreeze", { gameName, roundDuration });
        if (timer.GID) {
          const roundResult = await calculateResult(timer);
          await broadCastResults(gameName, roundDuration, roundResult,io);
          await transferForPayout(
            gameName,
            roundDuration,
            timer.GID,
            roundResult
          );
        }
        // Add round into database before starting the round
        try {
          timer.GID = await registerRound(gameName, timer.duration);
          timer.betAmount0 = 0;
          timer.betAmount1 = 0;
          console.log("Registered new round with ID:", timer.GID);
        } catch (error) {
          console.log("Failed to register new round:", error);
          continue;
        }
        timer.remainingTime = timer.duration * 60;
      } else {
        timer.remainingTime -= 1; // Decrement
        const newTimer = timer.remainingTime;
        io.emit("timerUpdate", { gameName, roundDuration, newTimer });
      }
    }
  }
};
const broadCastResults = async (gameName, roundDuration, roundResult,io) => {
  //Maintain only top N number of results for any round type and scrape remaining 
  try {
    const key = `roundResults:${gameName}:${roundDuration}`;

    // Push the new round result to the Redis list
    await redisClient.lPush(key, JSON.stringify(roundResult));

    // Trim the list to only keep the last 4 entries
    await redisClient.lTrim(key, 0, 10);

    // Retrieve the latest 4 results from the list
    const results = await redisClient.lRange(key, 0, 10);

    // Parse the results from JSON
    const parsedResults = results.map((result) => JSON.parse(result));

    // Broadcast the results to all connected clients
    io.emit("resultBroadcast",gameName,roundDuration, parsedResults);
  } catch (error) {
    console.error("Error broadcasting results:", error);
    throw error;
  }
};

module.exports = processTimers;
