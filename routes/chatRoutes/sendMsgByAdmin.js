const Chat=require('../../models/chatModel');

const sendChatUpdateOverSocket = require('./sendChatUpdateSocket');

const sendMsgByAdmin=async(req,res)=>{
    try{
        const {message,userId}=req.body;
        if(!message){
            return res.status(400).json({error:`Message input required`});
        }
        else if(!userId){
            return res.status(400).json({error:`UID input required`});
        }
        else if(message.length>150){
            return res.status(400).json({error:"Max length of message is 150 characters"});
        }
        else{
            const newChat=new Chat({sender:"admin",receiver:userId,message});
            await newChat.save();
            //send socket update to admin
            const io=req.app.locals.io;
            await sendChatUpdateOverSocket("admin",userId,newChat,io);
            res.status(200).json(newChat);
        }
    }
    catch(error){
        console.error(`Error sending message by user to admin : `,error);
        res.status(500).json({error:`Internal server error sending message`});
    }
}
module.exports=sendMsgByAdmin;