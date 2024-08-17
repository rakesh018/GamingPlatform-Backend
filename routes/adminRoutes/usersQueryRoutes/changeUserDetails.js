const { body, validationResult } = require("express-validator");
const User = require("../../../models/userModels");
const mongoose = require("../../../models/db");

const updateUser = async (req, res) => {
  // Validation middleware
   [body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a non-negative number")
    .run(req),
  
   body("referralCommission")
    .isFloat({ min: 1, max: 100 })
    .withMessage("Commission percentage must be between 1 and 100")
    .run(req),]

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }

  try {
    const userId = req.params?.userId; // Get userId from query params
    const { amount, referralCommission } = req.body;

    if (!userId) {
      throw new Error(
        JSON.stringify({ status: 400, message: "User ID is required" })
      );
    }

    if (amount < 0) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Invalid balance input" })
      );
    }

    // Check if userId is a valid ObjectId or a UID
    const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
    const updatedUser = await User.findOneAndUpdate(
      {
        $or: [...(isValidObjectId ? [{ _id: userId }] : []), { uid: userId }],
      },
      {
        balance: amount,
        withdrawableBalance:0,
        referralCommission: referralCommission
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error(
        JSON.stringify({ status: 404, message: "User not found" })
      );
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "Internal server error" };
    }
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = updateUser;
