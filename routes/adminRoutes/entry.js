const express = require("express");
const router = express.Router();

const usersQueryRoutes = require("./usersQueryRoutes/usersEntry");
const depositsRoutes=require("./depositRoutes/depositsEntry");
router.use("/users", usersQueryRoutes);
router.use("/deposits",depositsRoutes);

module.exports = router;
