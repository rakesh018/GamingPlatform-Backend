const Game = require("../../models/gameModel");
const calculateResult = async (timer) => {
  const roundResult = timer.betAmount0 <= timer.betAmount1 ? 0 : 1;
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
