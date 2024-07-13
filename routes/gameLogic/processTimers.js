const { registerRound } = require("./registerRound");


const processTimers = async (io,gameTimers) => {
    for (const gameName in gameTimers) {
      for (let roundIndex = 0; roundIndex < gameTimers[gameName].length; roundIndex++) {
        const timer = gameTimers[gameName][roundIndex];
        if (timer.remainingTime <= 0) {
          io.emit("roundFreeze", { gameName, roundIndex });
          if (timer.GID) {
            console.log(`${timer.GID} round ended`);
          }
          // Add round into database before starting the round
          try {
            timer.GID = await registerRound(gameName, timer.duration);
            console.log("Registered new round with ID:", timer.GID);
          } catch (error) {
            console.error("Failed to register new round:", error);
            continue;
          }
          timer.remainingTime = timer.duration * 60;
        } else {
          timer.remainingTime -= 1; // Decrement by 2 seconds
          const newTimer = timer.remainingTime;
          io.emit("timerUpdate", { gameName, roundIndex, newTimer });
        }
      }
    }
  };
module.exports=processTimers;