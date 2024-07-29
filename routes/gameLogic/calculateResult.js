const Game = require("../../models/gameModel");
const calculateResult = async (timer) => {
  let roundResult;
  if (timer.betAmount0 < timer.betAmount1) {
    roundResult = 0;
  } else if (timer.betAmount0 > timer.betAmount1) {
    roundResult = 1;
  } else {
    //determine result randomly
    roundResult = Math.round(Math.random());
  }
  const getGameDetails = await Game.findById(timer.GID);
  getGameDetails.result = roundResult;
  getGameDetails.betAmount0 = timer.betAmount0; //store bet amounts received on both outcomes
  getGameDetails.betAmount1 = timer.betAmount1;
  await getGameDetails.save();
  timer.betAmount0 = 0;
  timer.betAmount1 = 0; //resetting bet amounts for the next
  return roundResult;
};

module.exports = calculateResult;
