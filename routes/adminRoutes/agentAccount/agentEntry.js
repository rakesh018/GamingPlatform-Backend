const express = require("express");
const { body, validationResult } = require("express-validator");
const validateAdminToken = require("../../../middlewares/validateAdminToken");
const router = express.Router();
const User = require("../../../models/userModels");
const bcrypt = require("bcrypt"); // Make sure bcrypt is imported
const otpGenerator = require("otp-generator");

router.use(validateAdminToken);

// function to generate the uid
const generateUID = () => {
  return otpGenerator.generate(7, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

// Validation middleware
const validateDemoAccountInput = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("number").isMobilePhone().withMessage("Invalid Mobile number error"),
  body("referal")
    .matches(/^[A-Z0-9]{7}$/)
    .withMessage(
      "Referral should be digits and upper alphabets with 7 characters"
    ),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }
  next();
};

router.post(
  "/create-agent-account",
  validateDemoAccountInput,
  handleValidationErrors,
  async (req, res) => {
    try {
      // Expects {email, password, number,referal}
      const { email, password, number, referal } = req.body;
      const isreferalexist = await User.exists({ referralCode: referal });
      if (isreferalexist) {
        throw new Error(
          JSON.stringify({ status: 400, message: "Referal already exists" })
        );
      }

      //generate unique uid for agent user
      let uid;
      let uidExists = true;
      while (uidExists) {
        //Fool proof technique to ensure only unique uids exist in database
        uid = generateUID(); //Above function which generates 7 length uid for each user
        uidExists = await User.exists({ uid });
      }
      uid = `AG${uid}`;

      // Check if user already exists within the database
      const savedUser = await User.findOne({ email }); // Await the promise
      if (savedUser) {
        throw new Error(
          JSON.stringify({ status: 400, message: "User already exists" })
        );
      }

      const newUser = new User({
        email,
        password,
        uid: uid,
        phone: number,
        referralCode: referal,
        userType: "agent",
        isVerified: true,
      });

      await newUser.save();

      res.status(200).json({ message: "Agent account created successfully" });
    } catch (error) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (e) {
        parsedError = { status: 500, message: e.message };
      }
      console.error("Error occurred during creating Agent account : ", error);
      res.status(parsedError.status).json({ errors: parsedError.message });
    }
  }
);

module.exports = router;
