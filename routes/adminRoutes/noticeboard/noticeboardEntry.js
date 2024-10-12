const express = require("express");
const router = express.Router();

const createNotice = require("../noticeboard/createNotiece");
const getAllNotices= require("../noticeboard/getAllNotices");
const deleteNotice = require("../noticeboard/deleteNotice")
const validateAdminToken=require('../../../middlewares/validateAdminToken');



router.use(validateAdminToken);

// get all notieces
router.get("/", getAllNotices);
// post notieces
router.post("/createnotice",createNotice);
// delete notiece
router.delete('/:uid', deleteNotice);

module.exports = router;
