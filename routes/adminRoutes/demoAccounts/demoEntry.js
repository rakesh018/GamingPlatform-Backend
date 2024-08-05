const express = require("express");
const { body, validationResult } = require("express-validator");
const validateAdminToken = require("../../../middlewares/validateAdminToken");
const router = express.Router();
const User = require("../../../models/userModels");
const generateReferralCode = require("../../../middlewares/generateReferralCodeMiddleware");
const bcrypt = require("bcrypt"); // Make sure bcrypt is imported

router.use(validateAdminToken);

// Validation middleware
const validateDemoAccountInput = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("balance").isNumeric().withMessage("Balance must be a number"),
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
  "/create-demo-account",
  validateDemoAccountInput,
  handleValidationErrors,
  generateReferralCode,
  async (req, res) => {
    try {
      // Expects {email, password, balance}
      const { email, password, balance } = req.body;

      // Check if user already exists within the database
      const savedUser = await User.findOne({ email }); // Await the promise
      if (savedUser) {
        throw new Error(
          JSON.stringify({ status: 400, message: "User already exists" })
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 5); // Using salt rounds
      const newUser = new User({
        email,
        password: hashedPassword,
        uid:req.uid,
        phone: "12345", // Let's keep phone numbers of demo users as 12345
        balance,
        referralCode: req.referralCode,
        userType: "demo",
        isVerified:true,
      });

      await newUser.save();

      res.status(200).json({ message: "Demo account created successfully" });
    } catch (error) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (e) {
        parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
      }
      console.error("Error occurred during creating demo account : ", error);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

module.exports = router;
