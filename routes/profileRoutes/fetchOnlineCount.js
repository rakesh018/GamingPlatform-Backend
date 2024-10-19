const redisClient = require("../../configs/redisClient");
const fetchOnlineCount = async (req, res) => {
  try {
    const fetchedCount = await fetchCount();
    res.status(200).json({ onlineUserCount: fetchedCount });
  } catch (error) {
    console.error(
      `Error occured fetching online user count for the user`,
      error
    );
    res
      .status(500)
      .json({ error: "Error occured while fetching online user count" });
  }
};
const fetchCount = async () => {
  const onlineUserCount = await redisClient.get("onlineUserCount");
  if (!onlineUserCount) {
    return Math.floor(Math.random() * 20000) + 1;
  } else {
    return JSON.parse(onlineUserCount);
  }
};
module.exports = fetchOnlineCount;
