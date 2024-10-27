const express=require('express');
const validateAgentToken = require('../../middlewares/validateAgentToken');
const handleAgentLogin = require('./agentLogin');
const generatePSUForAgent = require('./getPsuForAgent');
const saveManualDepositKeyForAgent = require('./saveDepositKeyForAgent');
const validateWithdrawalRequest = require('../../middlewares/validateWithdrawalRequest');
const agentWithdrawalRequest = require('./agentWithdrawalRequest');
const router=express.Router();


router.post('/agent-login',handleAgentLogin);    
router.post('/get-psu-for-agent',validateAgentToken,generatePSUForAgent);  
router.post('/save-key-for-agent',validateAgentToken,saveManualDepositKeyForAgent);
router.post('/withdrawal',validateAgentToken,validateWithdrawalRequest,agentWithdrawalRequest);

module.exports=router;