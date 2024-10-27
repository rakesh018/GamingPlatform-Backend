const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const validateAgentToken = async (req, res,next) => {
  const token = req?.header("Authorization")?.split(" ")[1]; //'Bearer token
  if (!token) {
    return res.status(403).json({ error: "ACCESS DENIED, NO TOKEN PROVIDED" });
  }

  try {
    const decoded = jwt.verify(token, process.env.AGENT_JWT_SECRET);
    req.agentId = decoded.agentId;
    req.agentUID = decoded.agentUID;
    next();
  } catch (error) {
    console.log(`Error occured while validating token : ${errOR}`);
    res.status(403).json({ error: "INVALID TOKEN.PLEASE LOGIN" });
  }
};
module.exports = validateAgentToken;
