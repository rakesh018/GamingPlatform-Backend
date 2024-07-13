const gameTimers = {
  "coinFlip": [
    { duration: 1, remainingTime: 1 * 60 }, // Round 1
    { duration: 3, remainingTime: 3 * 60 }, // Round 2
    { duration: 5, remainingTime: 5 * 60 }, // Round 3
    { duration: 10, remainingTime: 10 * 60 }, // Round 4
  ],
  "stockTrader": [
    { duration: 1, remainingTime: 1 * 60 }, // Round 1
    { duration: 3, remainingTime: 3 * 60 }, // Round 2
    { duration: 5, remainingTime: 5 * 60 }, // Round 3
    { duration: 10, remainingTime: 10 * 60 }, // Round 4
  ],
};

const initializeTimers = (io) => {
  setInterval(() => {
    for (const gameName in gameTimers) {
      gameTimers[gameName].forEach((timer, roundIndex) => {
        if (timer.remainingTime <= 0) {
          // Reset the timer for next round
          io.emit('roundFreeze',{gameName,roundIndex});
          setTimeout(()=>{timer.remainingTime=timer.duration*60},5000);
        } else {
          timer.remainingTime-=1;
          let newTimer=timer.remainingTime;
          io.emit('timerUpdate',{gameName,roundIndex,newTimer});
        }
      });
    }
  }, 1000); // Broadcast every second
};

const stopTimer = (gameName, roundIndex) => {
  const timer = gameTimers[gameName][roundIndex];
  timer.remainingTime = 0;
};


module.exports = {
  initializeTimers,
  stopTimer,
  calculateResults,
};
