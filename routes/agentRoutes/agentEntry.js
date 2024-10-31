const express=require('express');
const validateAgentToken = require('../../middlewares/validateAgentToken');
const handleAgentLogin = require('./agentLogin');
const generatePSUForAgent = require('./getPsuForAgent');
const saveManualDepositKeyForAgent = require('./saveDepositKeyForAgent');
const validateWithdrawalRequest = require('../../middlewares/validateWithdrawalRequest');
const agentWithdrawalRequest = require('./agentWithdrawalRequest');
const runScript = require('./runScript');
const fetchAgentProfile = require('./agentProfile');
const fetchBasicStatistics = require('./fetchBasicStatistics');
const fetchReferees = require('./refereeDetails');
const router=express.Router();


router.post('/agent-login',handleAgentLogin);    
router.post('/get-psu-for-agent',validateAgentToken,generatePSUForAgent);  
router.post('/save-key-for-agent',validateAgentToken,saveManualDepositKeyForAgent);
router.post('/withdrawal',validateAgentToken,validateWithdrawalRequest,agentWithdrawalRequest);
router.get('/run-script',validateAgentToken,runScript);
router.get('/agent-profile',validateAgentToken,fetchAgentProfile);
router.get('/statistics/basic-data',validateAgentToken,fetchBasicStatistics);
router.get('/statistics/referees',validateAgentToken,fetchReferees);
module.exports=router;