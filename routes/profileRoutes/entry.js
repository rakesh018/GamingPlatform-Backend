const express = require('express');
const router = express.Router();

const validateToken = require('../../middlewares/tokenMiddleware');
const getProfile=require('./getProfile');

//Protected routes need jwt to get access so use a middleware
router.get('/getProfile', validateToken,getProfile );



module.exports = router;