const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();
const otpGenerator = require("otp-generator");
const { body, validationResult } = require("express-validator");

const User = require("../../models/userModels");
const OTP = require("../../models/otpModel");
const generateReferralCode = require("../../middlewares/generateReferralCodeMiddleware");
const validateToken = require("../../middlewares/tokenMiddleware");

// Route for user signup and OTP generation
router.post(
  "/signup/get-otp",
  [
    // Validate and sanitize inputs
    // body("email").isEmail().withMessage("INVALID EMAIL ERROR").normalizeEmail(),
    // body("password").isLength({ min: 6 }).withMessage("PASSWORD LENGTH ERROR"),
    body("phoneNumber")
      .isMobilePhone()
      .withMessage("INVALID PHONE NUMBER ERROR"),
    // body("referredBy")
    //   .optional()
    //   .isLength({ min: 7, max: 7 })
    //   .withMessage("INVALID REFERRAL CODE ERROR"),
  ],
  // generateReferralCode,
  async (req, res) => {
    try {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(
          JSON.stringify({ status: 400, message: errors.array()[0].msg })
        );
        //this will throw error with above mentioned messages
      }

      const { phoneNumber } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({
        phone: phoneNumber,
      });

      if (existingUser) {
        throw new Error(
          JSON.stringify({ status: 400, message: "USER ALREADY EXISTS ERROR" })
        );
      }

      // // Hash the password
      // const hashedPassword = await bcrypt.hash(password, 5); // Using salt rounds

      // // Create a new user in the database
      // const newUser = new User({
      //   email,
      //   password: hashedPassword,
      //   phone: phoneNumber,
      //   referralCode: req.referralCode,
      //   referredBy: req?.referredByUser ? req.referredByUser._id : null,
      // });

      // // Save the new user
      // const savedUser = await newUser.save();
      // if (!savedUser) {
      //   throw new Error(
      //     JSON.stringify({
      //       status: 500,
      //       message: "FAILED TO SAVE USER IN DATABASE ERROR",
      //     })
      //   );
      // }

      //Generate OTP
      const otpCode = otpGenerator.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      // // Send OTP via SMS
      const ReceiverUrl = `${process.env.RENFLAIR_URL}&PHONE=${phoneNumber}&OTP=${otpCode}`;
      const OTPresponse = await axios.get(ReceiverUrl);
      if (OTPresponse.data.status !== "SUCCESS") {
        throw new Error(
          JSON.stringify({ status: 500, message: "OTP SENDING ERROR" })
        );
      }

      // Save OTP to database
      //If already exists,update or else create new one
      const savedOTP = await OTP.findOneAndUpdate(
        {
          phone: phoneNumber,
          purpose: "registration",
        },
        {
          code: otpCode.toString(),
          createdAt: new Date(),
        },
        {
          new: true,
          upsert: true, //if not exists create one
          setDefaultsOnInsert: true,
        }
      );

      if (!savedOTP) {
        throw new Error(
          JSON.stringify({ status: 500, message: "FAILED TO SAVE OTP ERROR" })
        );
      }

      res.status(200).json({
        message: "OTP sent to user.",
      });
    } catch (error) {
      console.error("Error during signup and OTP generation:", error);
      const parsedError = JSON.parse(error.message);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

router.post(
  "/signup/validate-otp",
  [
    //Validate and sanitize inputs
    body("email").isEmail().withMessage("INVALID EMAIL ERROR").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("PASSWORD LENGTH ERROR"),
    body("phoneNumber")
      .isMobilePhone()
      .withMessage("INVALID PHONE NUMBER ERROR"),
    body("referralCode")
      .optional()
      .isLength({ min: 7, max: 7 })
      .withMessage("INVALID REFERRAL CODE ERROR"),
    body("otp").isLength({ min: 4, max: 4 }).withMessage("INVALID OTP ERROR"),
  ],
  generateReferralCode,
  async (req, res) => {
    try {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(
          JSON.stringify({ status: 400, message: errors.array()[0].msg })
        );
      }

      const { email, password, phoneNumber, otp } = req.body;

      //check if user exists with the email
      const emailExists = await User.exists({ email });
      if (emailExists) {
        throw new Error(
          JSON.stringify({ status: 400, message: "EMAIL ALREADY EXISTS" })
        );
      }

      // Find the OTP in the database
      const foundOTP = await OTP.findOne({ phone: phoneNumber, code: otp });
      if (!foundOTP) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "INVALID OR EXPIRED OTP ERROR",
          })
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 5); // Using salt rounds

      // Create a new user in the database
      const newUser = new User({
        email,
        password: hashedPassword,
        phone: phoneNumber,
        uid: req.uid, //uid and referralCode are generated in middleware and attached to req object
        referralCode: req.referralCode,
        referredBy: req?.referredByUser ? req.referredByUser._id : null,
        isVerified: true,
      });

      // Save the new user
      const savedUser = await newUser.save();
      if (!savedUser) {
        throw new Error(
          JSON.stringify({
            status: 500,
            message: "FAILED TO SAVE USER IN DATABASE ERROR",
          })
        );
      }

      // Generate a token with userId inside token
      const token = jwt.sign(
        { userId: savedUser._id, uid: savedUser.uid },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      //Delete OTP from database
      await OTP.deleteOne({ _id: foundOTP._id });

      res.status(200).json({ message: "OTP validated successfully", token });
    } catch (error) {
      console.error("Error during OTP validation:", error);
      const parsedError = JSON.parse(error.message);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

router.post(
  "/signin",
  [
    // Validate and sanitize inputs
    body("emailOrPhone")
      .notEmpty()
      .withMessage("EMAIL OR PHONE REQUIRED ERROR"),
    body("password").notEmpty().withMessage("PASSWORD NOT PRESENT ERROR"),
  ],
  async (req, res) => {
    try {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(
          JSON.stringify({ status: 400, message: errors.array()[0].msg })
        );
      }

      const { emailOrPhone, password } = req.body;

      // Check if the user exists by email or phone number
      const user = await User.findOne({
        $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      });

      if (!user) {
        throw new Error(
          JSON.stringify({ status: 404, message: "USER NOT FOUND ERROR" })
        );
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error(
          JSON.stringify({ status: 401, message: "INVALID PASSWORD ERROR" })
        );
      }

      //check if verified through otp
      const isVerified = user.isVerified;
      if (!isVerified) {
        throw new Error(
          JSON.stringify({ status: 400, message: "USER UNVERIFIED ERROR" })
        );
      }
      // Generate JWT token with expiry of 7 days
      const token = jwt.sign({ userId: user._id ,uid:user.uid}, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({ message: "Sign-in successful", token });
    } catch (error) {
      console.error("Error during sign-in:", error);

      const parsedError = JSON.parse(error.message);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

router.put(
  "/change-password",
  validateToken,
  [
    // Validate and sanitize inputs
    body("oldPassword").notEmpty().withMessage("OLD PASSWORD REQUIRED ERROR"),
    body("newPassword").notEmpty().withMessage("NEW PASSWORD REQUIRED ERROR"),
  ],
  async (req, res) => {
    try {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(
          JSON.stringify({ status: 400, message: errors.array()[0].msg })
        );
      }

      const userId = req.userId; // From middleware
      const { oldPassword, newPassword } = req.body;
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(
          JSON.stringify({ status: 404, message: "USER NOT FOUND ERROR" })
        );
      }

      // Check if the old password is correct
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isOldPasswordValid) {
        throw new Error(
          JSON.stringify({ status: 401, message: "INVALID OLD PASSWORD ERROR" })
        );
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 5);

      // Update the user's password
      user.password = hashedNewPassword;
      await user.save();

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error during password change:", error);

      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (parseError) {
        parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
      }

      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

router.get("/forgot-password/get-otp", validateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch the user by userId
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(
        JSON.stringify({ status: 404, message: "USER NOT FOUND ERROR" })
      );
    }

    // Generate OTP
    const otpCode = otpGenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // Send OTP via SMS
    const ReceiverUrl = `${process.env.RENFLAIR_URL}&PHONE=${user.phone}&OTP=${otpCode}`;
    const OTPresponse = await axios.get(ReceiverUrl);
    if (OTPresponse.data.status !== "SUCCESS") {
      throw new Error(
        JSON.stringify({ status: 500, message: "OTP SENDING ERROR" })
      );
    }

    // Save OTP to database
    //If already exists,update or else create new one
    const savedOTP = await OTP.findOneAndUpdate(
      {
        userId: user._id,
        purpose: "forgotPassword",
      },
      {
        code: otpCode.toString(),
        createdAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!savedOTP) {
      throw new Error(
        JSON.stringify({ status: 500, message: "FAILED TO SAVE OTP ERROR" })
      );
    }

    res.status(200).json({
      message: "OTP sent successfully.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error during forgot password OTP generation:", error);
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (parseError) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    res.status(parsedError.status).json({ error: parsedError.message });
  }
});

router.post(
  "/forgot-password/validate-otp",
  validateToken,
  [
    // Validate and sanitize inputs
    body("otp").isLength({ min: 4, max: 4 }).withMessage("INVALID OTP ERROR"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("PASSWORD LENGTH ERROR"),
  ],
  async (req, res) => {
    try {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new Error(
          JSON.stringify({ status: 400, message: errors.array()[0].msg })
        );
      }

      const { otp, newPassword } = req.body;
      const userId = req.userId; // validateToken sets

      // Find the OTP in the database
      const foundOTP = await OTP.findOne({
        userId,
        code: otp,
        purpose: "forgotPassword",
      });

      if (!foundOTP) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "INVALID OR EXPIRED OTP ERROR",
          })
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 5); // Using 5 salt rounds

      // Update the user's password
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error(
          JSON.stringify({
            status: 500,
            message: "FAILED TO UPDATE PASSWORD ERROR",
          })
        );
      }

      // Delete the OTP from the database
      await OTP.deleteOne({ _id: foundOTP._id });

      res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
      console.error("Error during OTP validation for password reset:", error);
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (parseError) {
        parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
      }
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

module.exports = router;
