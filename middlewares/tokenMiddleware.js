const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

//This middleware verifies jwt token and then proceeds to confirm if user is not banned
const validateToken = async (req, res, next) => {
  const token = req?.header("Authorization")?.split(" ")[1]; //'Bearer token
  if (!token) {
    return res.status(403).json({ error: "ACCESS DENIED, NO TOKEN PROVIDED" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    //also check if user is not banned
    const isBanned = await User.findOne({ _id: req.userId }).select(
      "isRestricted userType phone uid"
    );
    req.uid=isBanned.uid;
    //check if demo user or regular user
    if (isBanned.userType == "demo") {
      req.isDemo = true;
    } else {
      req.isDemo = false;
    }
    req.phone=isBanned.phone;
    if (isBanned.isRestricted) {
      return res.status(403).json({ error: `ACCESS DENIED` });
    } else {
      next();
    }
  } catch (err) {
    console.log(`Error occured while validating token : ${err}`);
    res.status(403).json({ error: "INVALID TOKEN.PLEASE LOGIN" });
  }
};

module.exports = validateToken;
