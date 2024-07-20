//For caching purpose
const redis = require("redis");

//Create a redis client
const client = redis.createClient({ url: "redis://localhost:6379" });

client.on("error", (err) => {
  console.error(`Redis error : `, error);
});

//Connect to the redis server
client
  .connect()
  .then(() => {
    console.log(`Connected to Redis database`);
  })
  .catch((err) => {
    console.log(`Error connecting Redis`);
  });

module.exports = client;
