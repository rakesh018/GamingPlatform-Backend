const express = require("express");
const router = express.Router();

const usersQueryRoutes = require("./usersQueryRoutes/usersEntry");
router.use("/users", usersQueryRoutes);

module.exports = router;
