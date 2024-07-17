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
    methods: ["GET", "POST"],
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

const authenticateSocketConnection = require("./routes/socketHandlers/authenticateSocketConnection");
const { socketHandler } = require("./routes/socketHandlers/connection");
const { initializeTimers } = require("./routes/gameLogic/timer");

require("./workers/payoutWorker"); //listens to payout queue to process

const authRoutes = require("./routes/authRoutes/signInSignUp");
app.use("/auth", authRoutes);

const profileRoutes = require("./routes/profileRoutes/entry");
app.use("/profile", profileRoutes);

const betRoutes = require("./routes/gameLogic/betRoutes");
app.use("/bets", betRoutes);

const paymentRoutes = require("./routes/paymentGateway/entry");
app.use("/payments", paymentRoutes);

// Socket.io connection
io.use(authenticateSocketConnection); //only authorized users must be able to get a socket connection
io.on("connection", socketHandler);
initializeTimers(io);
// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
