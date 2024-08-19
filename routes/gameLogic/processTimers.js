const { registerRound } = require("./registerRound");
const calculateResult = require("./calculateResult");
const transferForPayout = require("./transferForPayout");
const redisClient = require("../../configs/redisClient");
const processTimers = async (io, gameTimers) => {
  //access namespaces of user and admin
  const adminNamespace = io.of("/admin");
  const userNamespace = io.of("/user");
  for (const gameName in gameTimers) {
    for (
      let roundIndex = 0;
      roundIndex < gameTimers[gameName].length;
      roundIndex++
    ) {
      const timer = gameTimers[gameName][roundIndex];
      const roundDuration = timer.duration;
      if (timer.remainingTime <= 0) {
        userNamespace.emit("roundFreeze", { gameName, roundDuration });
        adminNamespace.emit("roundFreeze", { gameName, roundDuration });
        if (timer.GID) {
          const roundResult = await calculateResult(timer);
          await broadCastResults(
            gameName,
            roundDuration,
            roundResult,
            adminNamespace,
            userNamespace
          );
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
          timer.result = 2;
          console.log("Registered new round with ID:", timer.GID);
        } catch (error) {
          console.log("Failed to register new round:", error);
          continue;
        }
        timer.remainingTime = timer.duration * 60;
      } else {
        timer.remainingTime -= 1; // Decrement
        const newTimer = timer.remainingTime;
        userNamespace.emit("timerUpdate", {
          gameName,
          roundDuration,
          newTimer,
        }); //send timer updates to user sockets
        adminNamespace.emit("timerUpdate", {
          gameName,
          roundDuration,
          newTimer,
          betAmount0: timer.betAmount0,
          betAmount1: timer.betAmount1,
        }); //send timer details as well as bet amounts to admin
      }
    }
  }
};
const broadCastResults = async (
  gameName,
  roundDuration,
  roundResult,
  adminNamespace,
  userNamespace
) => {
  // //Maintain only top N number of results for any round type and scrape remaining
  // try {
  //   const key = `roundResults:${gameName}:${roundDuration}`;

  //   // Push the new round result to the Redis list
  //   await redisClient.lPush(key, JSON.stringify(roundResult));

  //   // Trim the list to only keep the last 10 entries
  //   await redisClient.lTrim(key, 0, 10);

  //   // Retrieve the latest 10 results from the list
  //   const results = await redisClient.lRange(key, 0, 10);

  //   // Parse the results from JSON
  //   const parsedResults = results.map((result) => JSON.parse(result));

  //   // Broadcast the results to all connected clients
  //   userNamespace.emit("resultBroadcast", gameName, roundDuration, parsedResults);
  //   adminNamespace.emit("resultBroadcast",gameName,roundDuration,roundResult);
  // } catch (error) {
  //   console.error("Error broadcasting results:", error);
  //   throw error;
  // }
  // Define keys for Redis
  // Define keys for Redis
  // Define keys for Redis
  const resultsKey = `roundResults:${gameName}:${roundDuration}`;
  const candlestickKey = `candlestickData:${gameName}:${roundDuration}`;

  try {
    // Push the new round result to the Redis list and trim to keep only the last 10 entries
    await redisClient.lPush(resultsKey, JSON.stringify(roundResult));
    await redisClient.lTrim(resultsKey, 0, 10);

    // Retrieve the latest 10 results from the list
    const results = await redisClient.lRange(resultsKey, 0, 10);
    const parsedResults = results.map((result) => JSON.parse(result));

    // Handle candlestick data
    let candlestickData = await redisClient.get(candlestickKey);
    candlestickData = candlestickData ? JSON.parse(candlestickData) : [];
    console.log(candlestickData);
    // Reverse the data to have the most recent entry at the start
    candlestickData.reverse();

    // Determine the change based on the round result
    const randomChange = Math.random() * 10;
    let lastOHLC =
      candlestickData.length > 0
        ? candlestickData[0] // Access the most recent data (as an array)
        : {
            x: new Date(),
            y: [6000.81, 6000.5, 6000.04, 6000.33],
          }; // Default OHLC values (array format)

    // console.log("Last OHLC (array):", lastOHLC);

    // Update OHLC values using array indexing
    const newClose =
      roundResult === 0
        ? lastOHLC.y[3] - randomChange // lastOHLC[3] is close
        : lastOHLC.y[3] + randomChange; // lastOHLC[3] is close
    const newHigh = Math.max(lastOHLC.y[1], newClose); // lastOHLC[1] is high
    const newLow = Math.min(lastOHLC.y[2], newClose); // lastOHLC[2] is low

    // Check for invalid values
    // if (
    //   isNaN(lastOHLC.y[0]) || // open
    //   isNaN(newHigh) ||
    //   isNaN(newLow) ||
    //   isNaN(newClose)
    // ) {
    //   console.error("Invalid OHLC values:", {
    //     open: lastOHLC.y[0],
    //     high: newHigh,
    //     low: newLow,
    //     close: newClose,
    //   });
    //   throw new Error("Invalid OHLC values");
    // }

    // // Log the new OHLC values
    // console.log("New OHLC Values (array):", {
    //   open: lastOHLC[0],
    //   high: newHigh,
    //   low: newLow,
    //   close: newClose,
    // });


    // Push new candlestick data at the beginning of the array
    candlestickData.unshift({
      x: new Date(),
      y: [lastOHLC.y[0], newHigh, newLow, newClose], // OHLC as array
    });

    // Limit the length of candlestick data
    if (candlestickData.length > 10) {
      candlestickData.pop(); // Remove the oldest data from the end
    }

    // Reverse back the data before caching
    candlestickData.reverse();

    // Cache the updated candlestick data
    await redisClient.set(candlestickKey, JSON.stringify(candlestickData));

    // Broadcast the results and candlestick data to all connected clients
    userNamespace.emit(
      "resultBroadcast",
      gameName,
      roundDuration,
      parsedResults,
      candlestickData
    );
    adminNamespace.emit(
      "resultBroadcast",
      gameName,
      roundDuration,
      roundResult,
      candlestickData
    );
  } catch (error) {
    console.error("Error broadcasting results:", error);
    throw error;
  }
};

module.exports = processTimers;
