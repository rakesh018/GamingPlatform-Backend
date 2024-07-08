//THIS CLIENT IS USED TO TEST THE SOCKET CONNECTION


const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  // Emit a message to the server
  socket.emit('clientMessage', 'Hello, Server!');

  // Listen for messages from the server
  socket.on('message', (msg) => {
    console.log('Message from server:', msg);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
});
