const { emitSocketMessage } = require("./socketMessage");

exports.socketHandler=(socket) => {
  
  console.log('New client connected : ',socket.userId);

  // Listen for events from the client
  socket.on('clientMessage', (msg) => {
    console.log('Message from client:', msg);
  });

  socket.on('startGame',(message)=>{
    const {roundIndex,gameName,betAmount}=message;
    parsedBetAmount=parseInt(betAmount,10);
    console.log(gameName,roundIndex,parsedBetAmount);
    emitSocketMessage(`Received bet`,socket);
  })


  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
}
