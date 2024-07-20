const User = require("../../../models/userModels");

const changeUserBalance = async (req, res) => {
  try {
    const userId = req.params?.userId;
    const newBalance = parseFloat(req.body.newBalance);
    if (!userId) {
      throw new Error(
        JSON.stringify({ status: 404, message: `INVALID USERID` })
      );
    }
    if (newBalance < 0) {
      throw new Error(
        JSON.stringify({ status: 400, messaage: `INVALID BALANCE INPUT` })
      );
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { balance: newBalance },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error(
        JSON.stringify({ status: 400, message: `USER NOT FOUND ERROR` })
      );
    }

    res.status(200).json({
      message: `User balance updated successfully.`,
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

module.exports = changeUserBalance;
