const redisClient = require("../../configs/redisClient");
const key = `onlineUserCount`;
const broadcastAndUpdateOnlineCount = async (io) => {
  const userNamespace = io.of("/user");
  let onlineUserCount = await redisClient.get(key);
  if (!onlineUserCount) {
    await setNewAndBroadcast(io);
  }
  else{
    //first access already present count
    const previousCount=await redisClient.get(key);
    let parsedPreviousCount=JSON.parse(previousCount);
    const randNum=getRandomNumberInRange(1,1000);
    const sign=positiveOrNegative();
    parsedPreviousCount+=(sign*randNum); //may move up or down
    if(parsedPreviousCount<1000 || parsedPreviousCount>20000){
        await setNewAndBroadcast();
    }
    else{
        await redisClient.set(key,JSON.stringify(parsedPreviousCount));
        io.emit("onlineUserCountUpdate",{onlineUserCount:parsedPreviousCount});
    }
  }
};
function getRandomNumberInRange(left, right) {
  return Math.floor(Math.random() * (right - left + 1)) + left;
}
const positiveOrNegative = () => {
  //with 75% probability it moves up and with 25% probability moves down
  let randomNumberForSign = Math.random();
  if (randomNumberForSign >= 0.75) {
    return -1;
  } else return 1;
};
const setNewAndBroadcast=async(io)=>{
    const randNum=getRandomNumberInRange(1000,20000);
    await redisClient.set(key,JSON.stringify(randNum));
    await io.emit("onlineUserCountUpdate",{onlineUserCount:randNum});
}
module.exports = broadcastAndUpdateOnlineCount;
