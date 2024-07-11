const socketIo = require('socket.io');
const authenticateToken = require('./socketAuthenticate');

const initSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // Allow only your frontend origin
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true
    }
  });

  io.use(authenticateToken);

  io.on('connection', (socket) => {
    socket.emit("message",'Hello client');
  });

  return io;
};

module.exports = initSocket;
