const express = require('express');
const router = express.Router();

const validateToken = require('../../middlewares/tokenMiddleware');
const getProfile=require('./getProfile');
const getTransactionHistory = require('./getTransactionHistory');
const getBettingHistory = require('./getBettingHistory');

//Protected routes need jwt to get access so use a middleware
router.get('/getProfile', validateToken,getProfile );
router.get('/get-transaction-history',validateToken,getTransactionHistory);
router.get('/get-betting-history',validateToken,getBettingHistory);


module.exports = router;