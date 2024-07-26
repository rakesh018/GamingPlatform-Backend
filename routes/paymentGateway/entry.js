const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const makeAutoPayment = require("./makeAutoPayment");
const validateToken = require("../../middlewares/tokenMiddleware"); //authorized users only must pass
const validateAutoPayment=require('../../middlewares/validateAutoPayment');
const webHook=require('./webHook');
const generatePSU = require("./manualDeposit");
const saveManualDepositKey = require("./saveManualDepositKey");

//routes
router.post("/auto-payment", validateToken, validateAutoPayment, makeAutoPayment);
router.post("/webhook",webHook);
router.post("/manual-payment/generate-psu",validateToken,generatePSU);
router.post("/manual-payment/save-key",validateToken,saveManualDepositKey);

module.exports = router;
