const express = require('express');
const { body, validationResult } = require('express-validator');
const Admin = require('../../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router=express.Router();

// Admin Login route with validation
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }

  try {
    const { username, password } = req.body;
    const adminDetails = await Admin.findOne({ user: username });
    if (!adminDetails) {
      throw new Error(
        JSON.stringify({ status: 400, message: 'USER NOT FOUND' })
      );
    }
    const isPasswordValid = await bcrypt.compare(password, adminDetails.password);
    if (!isPasswordValid) {
      throw new Error(
        JSON.stringify({ status: 400, message: 'INCORRECT PASSWORD' })
      );
    }

    // Generate a token with admin userId inside token
    const token = jwt.sign(
      { userId: adminDetails._id, role: 'admin' },
      process.env.ADMIN_JWT_SECRET
      // { expiresIn: '3d' }
    );

    res.status(200).json({ message: 'Login successful.', token: token });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: 'INTERNAL SERVER ERROR' };
    }
    res.status(parsedError.status).json({ error: parsedError.message });
  }
});

module.exports=router;