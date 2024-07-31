const Game = require("../../models/gameModel");
const calculateResult = async (timer) => {
  let roundResult;
  if (timer.result != 2) {
    //2 is default value for result that means it is yet to be calculated
    //if it is 1 or 2, it means that admin changed that and we need to set it as provided by admin
    roundResult = timer.result;
  } else if (timer.betAmount0 < timer.betAmount1) {
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
