const User = require("../../../models/userModels");
const mongoose = require('../../../models/db');

const banUser = async (req, res) => {
  try {
    const userId = req.params?.userId;
    if (!userId) {
      throw new Error(
        JSON.stringify({ status: 404, message: `INVALID USERID` })
      );
    }
    
    // Check if userId is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

    // Find the user based on userId or uid
    const user = await User.findOne({
      $or: [...(isValidObjectId ? [{ _id: userId }] : []), { uid: userId }],
    });

    if (!user) {
      throw new Error(
        JSON.stringify({ status: 400, message: `USER NOT FOUND ERROR` })
      );
    }

    // Toggle the `isRestricted` value
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id
      },
      { $set: { isRestricted: !user.isRestricted } },
      { new: true }
    );

    res.status(200).json({
      message: `User restriction status updated successfully`,
      user: updatedUser,
    });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: `INTERNAL SERVER ERROR.` };
    }
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = banUser;
