const express = require("express");
const router = express.Router();

const getAllUsers = require("./getAllUsers");
const getActiveUsers = require("./getActiveUsers");
const getUnverifiedUsers = require("./getUnverifiedUsers");
const getParticularUserDetails=require("./getParticularUserDetails");
const changeUserBalance=require('./changeUserBalance');
const banUser=require("./banUser");
const sendMail=require('./sendMail');
const validateAdminToken=require('../../../middlewares/validateAdminToken');
const customCommission = require("./customCommission");
const updateUser = require("./changeUserDetails");
const updateUserPassword = require("./updatePassword");
const fetchUserBetHistory = require("./fetchUserBetHistory");
const getTransactionHistory = require("./fetchTransactionHistory");
const loginAsUser = require("./loginAsUser");


router.use(validateAdminToken);

router.get("/", getAllUsers);
router.get("/active", getActiveUsers);
router.get("/unverified", getUnverifiedUsers);
router.get("/details/:userId",getParticularUserDetails);
router.post("/change-balance/:userId",changeUserBalance);
router.post("/ban-user/:userId",banUser);
router.post("/sendMail",sendMail);
router.post("/change-commission",customCommission);
router.post('/change-user-details/:userId',updateUser);
router.post('/update-user-password',updateUserPassword);
router.post('/fetch-user-bet-history',fetchUserBetHistory);
router.post('/fetch-transaction-history',getTransactionHistory);
router.post('/login-as-user',loginAsUser);

module.exports = router;
