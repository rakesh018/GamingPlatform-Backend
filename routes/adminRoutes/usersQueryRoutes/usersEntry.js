const express = require("express");
const router = express.Router();

const getAllUsers = require("./getAllUsers");
const getActiveUsers = require("./getActiveUsers");
const getUnverifiedUsers = require("./getUnverifiedUsers");
router.get("/", getAllUsers);
router.get("/active", getActiveUsers);
router.get("/unverified",getUnverifiedUsers);

module.exports = router;
