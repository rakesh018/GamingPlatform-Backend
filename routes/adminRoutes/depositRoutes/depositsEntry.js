const express = require("express");
const router = express.Router();
const getAllAutoDeposits=require('./getAllAutoDeposits');
const getAllManualDeposits=require('./getAllManualDeposits');
const getCompletedAutoDeposits = require("./getCompletedAutoDeposits");
const getPendingAutoDeposits = require("./getPendingAutoDeposits");
const getRejectedAutoDeposits = require("./getRejectedAutoDeposits");
const validateAdminToken=require('../../../middlewares/validateAdminToken');
const getCompletedManualDeposits = require("./getCompletedManualDeposits");


router.use(validateAdminToken);
router.get("/auto", getAllAutoDeposits);
router.get("/auto/completed",getCompletedAutoDeposits);
router.get("/auto/pending",getPendingAutoDeposits);
router.get("/auto/rejected",getRejectedAutoDeposits);
router.get("/manual", getAllManualDeposits);
router.get("/manual/completed",getCompletedManualDeposits);

module.exports = router;
