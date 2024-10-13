const express = require('express');
const router = express.Router();

const validateToken = require('../../middlewares/tokenMiddleware');
const getProfile=require('./getProfile');
const getTransactionHistory = require('./getTransactionHistory');
const getBettingHistory = require('./getBettingHistory');
const getLeaderBoardData = require('./getLeaderboardData');
const getAllNotifications = require('./getAllNotifications');
const markNotificationSeen = require('./markNotificationSeen');
const makeQuery = require('./makeQuery');
const getReferralCount = require('./referralCount');
const getAllNotices=require("./getAllnotices")

//Protected routes need jwt to get access so use a middleware
router.get('/getProfile', validateToken,getProfile );
router.get('/get-transaction-history',validateToken,getTransactionHistory);
router.get('/get-betting-history',validateToken,getBettingHistory);
router.get('/leaderboard/:type',validateToken,getLeaderBoardData);
router.get('/get-all-notifications',validateToken,getAllNotifications);
router.post('/mark-notification-seen',validateToken,markNotificationSeen);
router.post('/make-query',validateToken,makeQuery);
router.get('/referral-count',validateToken,getReferralCount);
router.get('/get-all-notices',validateToken,getAllNotices);

module.exports = router;