const User = require("../../../models/userModels");

const banUser = async (req, res) => {
  try {
    const userId = req.params?.userId;
    if (!userId) {
      throw new Error(
        JSON.stringify({ status: 404, message: `INVALID USERID` })
      );
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { isRestricted: true },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error(
        JSON.stringify({ status: 400, message: `USER NOT FOUND ERROR` })
      );
    }

    res.status(200).json({
      message: `User banned successfully`,
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
