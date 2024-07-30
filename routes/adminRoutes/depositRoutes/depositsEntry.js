const express = require("express");
const router = express.Router();
const getAllAutoDeposits=require('./getAllAutoDeposits');
const getAllManualDeposits=require('./getAllManualDeposits');
const getCompletedAutoDeposits = require("./getCompletedAutoDeposits");

router.get("/auto", getAllAutoDeposits);
router.get("/auto/completed",getCompletedAutoDeposits);
router.get("/manual", getAllManualDeposits);

module.exports = router;
