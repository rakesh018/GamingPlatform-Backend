const broadcastAndUpdateOnlineCount = require("./onlineCount");
const processTimers = require("./processTimers");
const gameTimers = {
  coinFlip: [
    { duration: 1, remainingTime: 1 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 1
    { duration: 3, remainingTime: 3 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 2
    { duration: 5, remainingTime: 5 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 3
    { duration: 10, remainingTime: 10 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 4
  ],
  stockTrader: [
    { duration: 1, remainingTime: 1 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 1
    { duration: 3, remainingTime: 3 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 2
    { duration: 5, remainingTime: 5 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 3
    { duration: 10, remainingTime: 10 * 0, GID: 0 ,betAmount0:0,betAmount1:0,result:2}, // Round 4
  ],
};

const initializeTimers = (io) => {
  let fiveMinuteCounter=300; //execute immediately
  const timerFunction = async () => {
    try {
      await processTimers(io, gameTimers);
      fiveMinuteCounter++;

      if(fiveMinuteCounter>=300){
        //five minutes have passed
        fiveMinuteCounter=0;
        await broadcastAndUpdateOnlineCount(io);
      }
    } catch (error) {
      console.error("Error in processTimers:", error);
    }
    setTimeout(timerFunction, 1000); // Schedule next execution
  };
  timerFunction(); // Initial call to start the cycle
};

const getRemainingTime = (gameName, roundDuration) => {
  //Returns remaining time for a particular round
  const game = gameTimers[gameName];
  if (!game) {
    throw new Error('Invalid game name');
  }

  const round = game.find(r => r.duration === roundDuration);
  if (!round) {
    throw new Error('Invalid round duration');
  }
  return round.remainingTime;
};

module.exports = {
  initializeTimers,
  getRemainingTime,
  gameTimers,
};
