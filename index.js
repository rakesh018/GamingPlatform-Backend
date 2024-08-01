require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");

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

// Cron jobs to timely update the leaderboards
const scheduleLeaderboardUpdates = require("./workers/leaderBoardScheduler");
scheduleLeaderboardUpdates();

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

userNamespace.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
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
