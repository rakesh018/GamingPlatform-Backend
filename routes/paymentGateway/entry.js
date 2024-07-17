const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const makeAutoPayment = require("./makeAutoPayment");
const validateToken = require("../../middlewares/tokenMiddleware"); //authorized users only must pass
const validateAutoPayment=require('../../middlewares/validateAutoPayment');


//routes
router.post("/auto-payment", validateToken, validateAutoPayment, makeAutoPayment);

module.exports = router;
