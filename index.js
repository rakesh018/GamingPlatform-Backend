require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const redisClient = require("./configs/redisClient");

// Creation of server which could enable both http and socket requests
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow only your frontend origin or use "*" to allow all
    methods: ["GET", "POST", "OPTIONS", "PUT"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 3000;

// Enable CORS for Express
app.use(cors());

// Parse application/json
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded (especially for webhook)
app.use(bodyParser.urlencoded({ extended: true }));

const { initializeTimers } = require("./routes/gameLogic/timer");

require("./workers/payoutWorker"); // Listens to payout queue to process
require("./workers/notificationsWorker"); // Listens to notification queue

app.locals.io=io;
const authRoutes = require("./routes/authRoutes/signInSignUp");
app.use("/auth", authRoutes);

const profileRoutes = require("./routes/profileRoutes/entry");
app.use("/profile", profileRoutes);

const betRoutes = require("./routes/gameLogic/betRoutes");
app.use("/bets", betRoutes);

const paymentRoutes = require("./routes/paymentGateway/entry");
app.use("/payments", paymentRoutes);

const adminRoutes = require("./routes/adminRoutes/entry");
app.use("/admin", adminRoutes);

const chatRoutes=require('./routes/chatRoutes/chatEntry');
app.use("/chat",chatRoutes);

const agentRoutes=require('./routes/agentRoutes/agentEntry');
app.use("/agent",agentRoutes);

// Cron jobs to timely update the leaderboards
const scheduleLeaderboardUpdates = require("./workers/leaderBoardScheduler");
scheduleLeaderboardUpdates();

//Cron job to start the lottery daily
const scheduleLottery=require('./workers/lotteryScheduler');
scheduleLottery();

//Cron jobs to timely update the analytics
const scheduleAnalyticsUpdates = require("./workers/analyticsScheduler");
scheduleAnalyticsUpdates();

//Cron job to timely clean up AWS
const scheduleAWSCleanup = require("./workers/awsCleanupScheduler");
scheduleAWSCleanup();
// Define namespaces (admin socket and user socket)
const adminNamespace = io.of("/admin");
const userNamespace = io.of("/user");

// Middleware for authenticating socket connections
const authenticateUserSocket = require("./routes/socketHandlers/authenticateUserSocket");
const authenticateAdminSocket = require("./routes/socketHandlers/authenticateAdminSocket");
userNamespace.use(authenticateUserSocket);
// adminNamespace.use(authenticateAdminSocket);

// Socket.io connection handlers
adminNamespace.on("connection", (socket) => {
  console.log("Admin connected");

  socket.on("disconnect", () => {
    console.log("Admin disconnected");
  });
});
const userSocketMap = "user_socket_map";
userNamespace.on("connection", async (socket) => {
  console.log("User connected", socket.id);
  try {
    await redisClient.hSet(userSocketMap, socket.userId, socket.id);
  } catch (error) {
    console.error(`Error adding user socket to redis `, error);
  }

  socket.on("disconnect", async () => {
    console.log("User disconnected", socket.id);
    try {
      await redisClient.hDel(userSocketMap, socket.userId);
    } catch (error) {
      console.error(`Error removing user socket from redis `, error);
    }
  });
});

// Initialize timers
initializeTimers(io);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the io instance
module.exports = io;
