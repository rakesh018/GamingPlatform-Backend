//It is a http route
const express=require('express');
const validateToken = require('../../middlewares/tokenMiddleware');
const validateBet  = require('../../middlewares/betMiddleware');
const router=express.Router();
const activeBets=require('./activeBetsQueues');
router.post('/makeBet', validateToken, validateBet, async (req, res) => {
    const { gameName, roundDuration, betAmount } = req.body;

    // Check if the queue exists for the given game and round duration
    const queue = activeBets[gameName][roundDuration];

    // Add the bet to the respective queue
    try {
        await queue.add('bet', { betAmount });
        res.status(200).json({ message: `Received ${betAmount} on ${gameName} for round ${roundDuration}` });
    } catch (error) {
        console.error('Error adding bet to queue:', error);
        res.status(500).json({ message: 'Error processing your bet' });
    }
});

module.exports=router;