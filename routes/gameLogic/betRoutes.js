//It is a http route
const express=require('express');
const validateToken = require('../../middlewares/tokenMiddleware');
const validateBet  = require('../../middlewares/betMiddleware');
const router=express.Router();

router.post('/makeBet',validateToken,validateBet,(req,res)=>{
    const {gameName,roundDuration,betAmount}=req.body;
    res.status(200).json({message:`Received ${betAmount} on ${gameName} :${roundDuration}`});
})



module.exports=router;