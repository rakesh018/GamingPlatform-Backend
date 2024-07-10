require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

//Creation of server which could enable both http and socket requests
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

const authRoutes=require("./routes/authRoutes/signup")

// Enable CORS
app.use(cors());

// Use express.json()
app.use(express.json());

// HTTP route example
app.get('/check', (req, res) => {
  res.send('Hello, HTTP request!');
});


app.use('/auth',authRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Emit a message to the client
  socket.emit('message', 'Hello, WebSocket connection!');

  // Listen for events from the client
  socket.on('clientMessage', (msg) => {
    console.log('Message from client:', msg);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected'); 
  });
});


// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
