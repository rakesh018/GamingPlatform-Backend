const express = require("express");
const router = express.Router();

const getAllUsers = require("./getAllUsers");
const getActiveUsers = require("./getActiveUsers");
const getUnverifiedUsers = require("./getUnverifiedUsers");
const getParticularUserDetails=require("./getParticularUserDetails");

router.get("/", getAllUsers);
router.get("/active", getActiveUsers);
router.get("/unverified", getUnverifiedUsers);
router.get("/details/:userId",getParticularUserDetails);


module.exports = router;
