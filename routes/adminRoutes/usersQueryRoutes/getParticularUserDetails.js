const User = require("../../../models/userModels");

const getParticularUserDetails = async (req, res) => {
  try {
    const userId = req.params?.userId;
    if (!userId) {
      throw new Error(
        JSON.stringify({ status: 404, message: `INVALID USERID` })
      );
    }
    const getUser = await User.findOne({_id:userId});
    if (!getUser) {
      throw new Error(
        JSON.stringify({ status: 400, message: `INVALID USER ID` })
      );
    }
    res
      .status(200)
      .json({ message: `User details fetched successfully.`, user: getUser });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: `ERROR FETCHING USER DETAILS` };
    }
    console.error(`ERROR FETCHING USER DETAILS : ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getParticularUserDetails;
