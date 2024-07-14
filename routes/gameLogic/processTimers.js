const { registerRound } = require("./registerRound");
const calculateResult=require('./calculateResult');
const transferForPayout=require('./transferForPayout');
const processTimers = async (io,gameTimers) => {
    for (const gameName in gameTimers) {
      for (let roundIndex = 0; roundIndex < gameTimers[gameName].length; roundIndex++) {
        const timer = gameTimers[gameName][roundIndex];
        const roundDuration=timer.duration;
        if (timer.remainingTime <= 0) {
          io.emit("roundFreeze", { gameName, roundDuration });
          if (timer.GID) {
            const roundResult=await calculateResult(timer);
            await transferForPayout(gameName,roundDuration,timer.GID,roundResult,);
          }
          // Add round into database before starting the round
          try {
            timer.GID = await registerRound(gameName, timer.duration);
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
module.exports=processTimers;