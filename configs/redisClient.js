//For caching purpose
const redis = require("redis");

//Create a redis redisClient
const redisClient = redis.createClient({ url: "redis://localhost:6379" });

redisClient.on("error", (err) => {
  console.error(`Redis error : `, error);
});

//Connect to the redis server
redisClient
  .connect()
  .then(() => {
    console.log(`Connected to Redis database`);
  })
  .catch((err) => {
    console.log(`Error connecting Redis`);
  });

module.exports = redisClient;
