const express = require("express");
const router = express.Router();
const getAllAutoDeposits=require('./getAllAutoDeposits');
const getAllManualDeposits=require('./getAllManualDeposits');

router.get("/auto", getAllAutoDeposits);
router.get("/manual", getAllManualDeposits);

module.exports = router;
