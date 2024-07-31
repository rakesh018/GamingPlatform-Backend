const jwt = require('jsonwebtoken');

const authenticateAdminSocket = (socket, next) => {
  const token = socket?.handshake?.auth?.token.split(' ')[1];
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userId=decoded.userId;
    next();
  });
};

module.exports = authenticateAdminSocket;
