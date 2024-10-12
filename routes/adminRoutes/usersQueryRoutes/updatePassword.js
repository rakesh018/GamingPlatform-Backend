const { body, validationResult } = require("express-validator");
const User = require("../../../models/userModels");
const mongoose = require("../../../models/db");

const updateUserPassword = async (req, res) => {
  try {
    const { uid, newPassword } = req.body;
    console.log(uid,newPassword)

    if (!uid) {
      throw new Error(
        JSON.stringify({ status: 400, message: "User ID is required" })
      );
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error(
        JSON.stringify({
          status: 400,
          message: "Minimum length of password is 6",
        })
      );
    }

    //update password of the user
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { password: newPassword },
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

module.exports = updateUserPassword;
