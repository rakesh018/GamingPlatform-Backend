const express = require("express");
const validateAdminToken = require("../../../middlewares/validateAdminToken");
const getAllWithdrawals = require("./getAllWithdrawals");
const getCompletedWithdrawals=require('./getCompletedWithdrawals');
const getRejectedWithdrawals = require("./getRejectedWithdrawals");
const getPendingWithdrawals = require("./getPendingWithdrawals");
const getParticularWithdrawal = require("./getParticularWithdrawal");
const actionRoutes=require('./withdrawalActionRoutes');
const router = express.Router();


router.use(validateAdminToken);

router.get("/get-all-withdrawals",getAllWithdrawals);
router.get('/get-completed-withdrawals',getCompletedWithdrawals);
router.get('/get-rejected-withdrawals',getRejectedWithdrawals);
router.get('/get-pending-withdrawals',getPendingWithdrawals);
router.get('/details/:withdrawalId',getParticularWithdrawal);
router.use('/action',actionRoutes);


module.exports=router;