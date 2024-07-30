const express = require("express");
const router = express.Router();
const getAllAutoDeposits=require('./getAllAutoDeposits');
const getAllManualDeposits=require('./getAllManualDeposits');
const getCompletedAutoDeposits = require("./getCompletedAutoDeposits");
const getPendingAutoDeposits = require("./getPendingAutoDeposits");

router.get("/auto", getAllAutoDeposits);
router.get("/auto/completed",getCompletedAutoDeposits);
router.get("/auto/pending",getPendingAutoDeposits);
router.get("/manual", getAllManualDeposits);

module.exports = router;
