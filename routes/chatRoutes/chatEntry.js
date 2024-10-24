const express=require("express");
const router=express.Router();
const validateToken=require('../../middlewares/tokenMiddleware');
const sendMsgByUser = require("./sendMsgByUser");
const validateAdminToken = require("../../middlewares/validateAdminToken");
const sendMsgByAdmin = require("./sendMsgByAdmin");
const fetchChatForUser = require("./fetchChatForUser");
const fetchChatForAdmin = require("./fetchChatForAdmin");
const fetchAllChatsForAdmin = require("./fetchAllChatsAdmin");
const markMessagesAsSeen = require("./markChatSeen");


router.post('/send-msg-by-user',validateToken,sendMsgByUser);
router.post('/send-msg-by-admin',validateAdminToken,sendMsgByAdmin);
router.get('/fetch-chat-for-user',validateToken,fetchChatForUser);
router.post('/fetch-chat-for-admin',validateAdminToken,fetchChatForAdmin);
router.get('/fetch-all-chats',validateAdminToken,fetchAllChatsForAdmin);
router.post('/mark-chat-seen',validateAdminToken,markMessagesAsSeen);

module.exports=router;