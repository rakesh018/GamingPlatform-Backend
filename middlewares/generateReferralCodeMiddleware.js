const otpGenerator = require("otp-generator");
const User = require("../models/userModels");

//Generate unique referral code containing capital alphabets and numerics and validate Referred by code (if exists)
const generateCode = () => {
  return otpGenerator.generate(7, {
    digits: true,
    upperCaseAlphabets: true,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

const generateReferralCode = async (req, res, next) => {
  try {
    let code;
    let codeExists = true;
    while (codeExists) {
      //Fool proof technique to ensure only unique codes exist in database
      code = generateCode(); //Above function which generates 7 length code
      codeExists = await User.exists({ referralCode: code });
    }
    req.referralCode = code; //Attach referral code to req object
    validateReferredBy(req);
    next();
  } catch (error) {
    console.error(`Error in referral code generation middleware : `, error);
    res.status(500).json({ error: `INTERNAL SERVER ERROR` });
  }
};

const validateReferredBy = async (req) => {
  const referralCode = req.body?.referralCode; //optional chaining to check if the field exists in the request body
  const referredByUser = referralCode
    ? await User.findOne({ referralCode })
    : null; //if no user with the code, set it null
  req.referredByUser = referredByUser;
};

module.exports = generateReferralCode;
