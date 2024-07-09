const express=require("express");
const bcrypt=require("bcrypt");
const User=require("../../models/userModels")
const otpGenerator=require("otp-generator");
const axios=require("axios")
const router=express.Router();

// Route for user signup and OTP generation
router.post('/signup/get-otp', async (req, res) => {
    try {
        const { email, password, phoneNumber } = req.body;

        // Validate inputs
        if (!email || !password || !phoneNumber) {
            return res.status(400).json({ error: 'Email, password, and phone number are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // Using 10 salt rounds

        // Create a new user in the database
        const newUser = new User({
            email,
            password: hashedPassword,
            phone: phoneNumber,
        });

        // Save the new user
        const savedUser = await newUser.save();

        const otpCode = otpGenerator.generate(6,{digits:true,lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});

        // Save OTP to database
        const newOTP = new OTP({
            userId: savedUser._id, // Associate OTP with the newly created user
            code: otpCode.toString(),
            purpose: 'registration', // Specify the purpose
            createdAt: new Date(),
        });

        await newOTP.save(); // Save OTP to database

        // Return success response with OTP for testing purposes (normally send via SMS)
        const ReceiverUrl = `${process.env.RENFLAIR_URL}&PHONE=${phoneNumber}&OTP=${otpCode}`;
        await axios.post(ReceiverUrl);

        res.status(200).json({ message: 'User registered successfully. OTP sent to user.'});

    } catch (error) {
        console.error('Error during signup and OTP generation:', error);
        res.status(500).json({ error: 'Failed to register user and generate OTP' });
    }
});

