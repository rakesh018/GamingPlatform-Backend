const redisClient=require('../../configs/redisClient');
const sendChatUpdateOverSocket=async(sender,receiver,message,io)=>{
    const adminNamespace=io.of('/admin');
    const userNamespace=io.of('/user');
    if(receiver==='admin'){
        adminNamespace.emit('chatMessage',{newChat:message});
    }
    else{
        //sender is admin which means send private message to that specific user
        const targetSocketId=await redisClient.hGet("user_socket_map",receiver);
        if(targetSocketId){
            //it means that currently user is connected through socket
            //if not found, it means that user is not connected currently 
            userNamespace.to(targetSocketId).emit('chatMessage',{newChat:message});
        }
    }
}
module.exports=sendChatUpdateOverSocket;