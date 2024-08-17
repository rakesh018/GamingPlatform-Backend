const express = require("express");
const validateAdminToken = require("../../../middlewares/validateAdminToken");
const router = express.Router();
const User = require("../../../models/userModels");
const generateUpiPsu = require("./getUpiPsu");
const getUpiDetails = require("./getUpiDetails");
const updateUpiDetails = require("./updateUpiDetails");



router.post('/get-psu-upi',validateAdminToken,generateUpiPsu);
router.get('/get-upi-details',getUpiDetails);
router.post('/update-upi-details',validateAdminToken,updateUpiDetails);
module.exports=router;