const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const axios = require("axios");
const router = express.Router();
const otpGenerator = require("otp-generator");
const { body, validationResult } = require("express-validator");

const User = require("../../models/userModels");
const OTP = require("../../models/otpModel");
const generateReferralCode=require('../../middlewares/generateReferralCodeMiddleware');

// Route for user signup and OTP generation
router.post('/signup/get-otp', [
    // Validate and sanitize inputs
    body('email').isEmail().withMessage('INVALID EMAIL ERROR').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('PASSWORD LENGTH ERROR'),
    body('phoneNumber').isMobilePhone().withMessage('INVALID PHONE NUMBER ERROR'),
    body('referredBy').optional().isLength({min:7,max:7}).withMessage('INVALID REFERRAL CODE ERROR'),
], generateReferralCode,async (req, res) => {
    try {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(JSON.stringify({ status: 400, message: errors.array()[0].msg }));
            //this will throw error with above mentioned messages
        }

        const { email, password, phoneNumber } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone: phoneNumber }] });

        if (existingUser) {
            throw new Error(JSON.stringify({ status: 400, message: 'USER ALREADY EXISTS ERROR' }));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 5); // Using salt rounds

        // Create a new user in the database
        const newUser = new User({
            email,
            password: hashedPassword,
            phone: phoneNumber,
            referralCode:req.referralCode,
            referredBy:req?.referredByUser?req.referredByUser._id:null,
        });

        // Save the new user
        const savedUser = await newUser.save();
        if (!savedUser) {
            throw new Error(JSON.stringify({ status: 500, message: "FAILED TO SAVE USER IN DATABASE ERROR" }));
        }

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
        if (OTPresponse.data.status !== 'SUCCESS') {
            throw new Error(JSON.stringify({ status: 500, message: "OTP SENDING ERROR" }));
        }

        // Save OTP to database
        const newOTP = new OTP({
            userId: savedUser._id, // Associate OTP with the newly created user
            code: otpCode.toString(),
            purpose: 'registration', // Specify the purpose
            createdAt: new Date(),
        });

        const savedOTP = await newOTP.save();
        if (!savedOTP) {
            throw new Error(JSON.stringify({ status: 500, message: 'FAILED TO SAVE OTP ERROR' }));
        }

        res.status(200).json({ message: 'User registered successfully. OTP sent to user.', userId: savedUser._id });

    } catch (error) {
        console.error('Error during signup and OTP generation:', error);
        const parsedError = JSON.parse(error.message);
        res.status(parsedError.status).json({ error: parsedError.message });
    }
});


router.post('/signup/validate-otp', [
    // Validate and sanitize inputs
    body('userId').isMongoId().withMessage('INVALID USER ID ERROR'),
    body('otp').isLength({ min: 4, max: 4 }).withMessage('INVALID OTP ERROR'),
    body('purpose').equals('registration').withMessage('INVALID PURPOSE ERROR'),
], async (req, res) => {
    try {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(JSON.stringify({ status: 400, message: errors.array()[0].msg }));
        }

        const { userId, otp } = req.body;

        // Find the OTP in the database
        const foundOTP = await OTP.findOne({ userId, code: otp });

        if (!foundOTP) {
            throw new Error(JSON.stringify({ status: 400, message: 'INVALID OR EXPIRED OTP ERROR' }));
        }

        // Update user's isVerified status to true
        const updatedUser = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });

        if (!updatedUser) {
            throw new Error(JSON.stringify({ status: 500, message: 'FAILED TO UPDATE USER STATUS ERROR' }));
        }

        // Generate a token with userId inside token
        const token = jwt.sign({ userId: updatedUser._id }, process.env.JWT_SECRET,{expiresIn:'7d'});

        //Delete OTP from database
        await OTP.deleteOne({ _id: foundOTP._id });

        res.status(200).json({ message: 'OTP validated successfully', token });

    } catch (error) {
        console.error('Error during OTP validation:', error);
        const parsedError = JSON.parse(error.message);
        res.status(parsedError.status).json({ error: parsedError.message });
    }
});


router.post('/signin', [
    // Validate and sanitize inputs
    body('emailOrPhone').notEmpty().withMessage('EMAIL OR PHONE REQUIRED ERROR'),
    body('password').notEmpty().withMessage('PASSWORD NOT PRESENT ERROR'),
], async (req, res) => {
    try {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new Error(JSON.stringify({ status: 400, message: errors.array()[0].msg }));
        }

        const { emailOrPhone, password } = req.body;

        // Check if the user exists by email or phone number
        const user = await User.findOne({
            $or: [
                { email: emailOrPhone },
                { phone: emailOrPhone }
            ]
        });

        if (!user) {
            throw new Error(JSON.stringify({ status: 404, message: 'USER NOT FOUND ERROR' }));
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error(JSON.stringify({ status: 401, message: 'INVALID PASSWORD ERROR' }));
        }

        // Generate JWT token with expiry of 7 days
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: 'Sign-in successful', token });

    } catch (error) {
        console.error('Error during sign-in:', error);

        const parsedError = JSON.parse(error.message);
        res.status(parsedError.status).json({ error: parsedError.message });
    }
});




module.exports = router;



