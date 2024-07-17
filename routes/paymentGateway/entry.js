const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const makeAutoPayment = require("./makeAutoPayment");
const validateToken = require("../../middlewares/tokenMiddleware"); //authorized users only must pass
const validateAutoPayment=require('../../middlewares/validateAutoPayment');
const webHook=require('./webHook');

//routes
router.post("/auto-payment", validateToken, validateAutoPayment, makeAutoPayment);
router.post("/webhook",webHook);


module.exports = router;
