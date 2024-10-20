const express = require("express");
const router = express.Router();

const usersQueryRoutes = require("./usersQueryRoutes/usersEntry");
const depositsRoutes=require("./depositRoutes/depositsEntry");
const adminLogin = require("./adminLogin");
const gameRoutes=require('./gameRoutes/gameEntry');
const demoRoutes=require('./demoAccounts/demoEntry');
const withdrawalRoutes=require('./withdrawalRoutes/withdrawalEntry');
const upiRoutes=require('./UPI/upiEntry');
const queryRoutes=require('./supportRoutes/supportEntry');
const noticeRoute =require("./noticeboard/noticeboardEntry")
const agentRoutes=require("./agentAccount/agentEntry")
const getAnalytics = require("./analytics");

router.use("/users", usersQueryRoutes);
router.use("/deposits",depositsRoutes);
router.use("/auth",adminLogin);
router.use("/games",gameRoutes);
router.use('/demo',demoRoutes);
router.use('/agent',agentRoutes);
router.use('/withdrawals',withdrawalRoutes);
router.get('/analytics/:type',getAnalytics);
router.use('/upi',upiRoutes);
router.use('/query',queryRoutes);
router.use("/notice",noticeRoute)

module.exports = router;
