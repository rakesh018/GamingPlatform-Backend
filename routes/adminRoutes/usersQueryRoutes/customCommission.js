const { body, validationResult } = require('express-validator');
const User = require("../../../models/userModels");

const customCommission = async (req, res) => {
  // Validation middleware
  await body('userId')
    .notEmpty()
    .withMessage('User id required')
    .run(req);
  await body('referralCommission')
    .isFloat({ min: 1, max: 100 })
    .withMessage('Commission percentage must be between 1 and 100')
    .run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }

  try {
    const { userId, referralCommission } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { referralCommission: referralCommission },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Could not update commission percentage",
        })
      );
    }
    res.status(200).json({
      message: "Commission percentage updated successfully and will apply from next referral bonus",
      user: updatedUser
    });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    console.error("Error occurred during modifying game result: ", error);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = customCommission;
