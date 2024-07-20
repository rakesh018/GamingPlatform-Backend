const express = require("express");
const router = express.Router();

const getAllUsers = require("./getAllUsers");
const getActiveUsers = require("./getActiveUsers");
const getUnverifiedUsers = require("./getUnverifiedUsers");
const getParticularUserDetails=require("./getParticularUserDetails");
const changeUserBalance=require('./changeUserBalance');
const banUser=require("./banUser");

router.get("/", getAllUsers);
router.get("/active", getActiveUsers);
router.get("/unverified", getUnverifiedUsers);
router.get("/details/:userId",getParticularUserDetails);
router.post("/change-balance/:userId",changeUserBalance);
router.post("/ban-user/:userId",banUser);

module.exports = router;
