const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();
const otpGenerator = require("otp-generator");
const { body, validationResult } = require("express-validator");
const User = require("../../../models/userModels");
const OTP = require("../../../models/otpModel");
const generateReferralCode = require("../../../middlewares/generateReferralCodeMiddleware");
const validateToken = require("../../../middlewares/tokenMiddleware");
const validateAdminToken = require("../../../middlewares/validateAdminToken");
const admin = require("../../../models/admin");

router.post(
  "/change-password/get-otp",
  [body("oldpassword").notEmpty().withMessage("oldpassword is required")],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0].msg });
    }

    try {
      const { oldpassword } = req?.body;
      if (!oldpassword) {
        throw new Error(
          JSON.stringify({ status: 400, message: "oldPassword required" })
        );
      }
      // Fetch the user by userId
      const user = await admin.findOne();
      console.log(user);
      if (!user) {
        throw new Error(
          JSON.stringify({ status: 404, message: "USER NOT FOUND ERROR" })
        );
      }


        if(user.password!==oldpassword){
          throw new Error(
              JSON.stringify({ status: 404, message: "OldPassword is not matching" })
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
      const ReceiverUrl = `${
        process.env.RENFLAIR_URL
      }&PHONE=${6301912774}&OTP=${otpCode}`; //hardcoding with mobile number
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
          phone: 6301912774,
          purpose: "adminPasswordChange",
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
      console.error("Error during change password OTP generation:", error);
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (parseError) {
        parsedError = { status: 500, message: parseError.message };
      }
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

router.post(
  "/change-password/validate-otp",
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

      // Find the OTP in the database
      const foundOTP = await OTP.findOne({
        phone: 6301912774,
        code: otp,
        purpose: "adminPasswordChange",
      });

      if (!foundOTP) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: "INVALID OR EXPIRED OTP ERROR",
          })
        );
      }

      // find admin to change the password
      const Adminold = await admin.findOne();

    //    throwing the error if admin not found
      if (!Adminold) {
        throw new Error(
          JSON.stringify({
            status: 500,
            message: "FAILED TO UPDATE PASSWORD ERROR",
          })
        );
      }

      // changing the admin password
      Adminold.password = newPassword;
      await Adminold.save();

      // Delete the OTP from the database
      await OTP.deleteOne({ _id: foundOTP._id });

      res.status(200).json({ message: "Password changed successfully." });
    } 
    
    
    catch (error) {
      console.error("Error during OTP validation for password change:", error);
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (parseError) {
        parsedError = { status: 500, message: parseError.message };
      }
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  }
);

module.exports = router;
