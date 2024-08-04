const express = require("express");
const router = express.Router();

const usersQueryRoutes = require("./usersQueryRoutes/usersEntry");
const depositsRoutes=require("./depositRoutes/depositsEntry");
const adminLogin = require("./adminLogin");
const gameRoutes=require('./gameRoutes/gameEntry');
const demoRoutes=require('./demoAccounts/demoEntry');

router.use("/users", usersQueryRoutes);
router.use("/deposits",depositsRoutes);
router.use("/auth",adminLogin);
router.use("/games",gameRoutes);
router.use('/demo',demoRoutes);

module.exports = router;
