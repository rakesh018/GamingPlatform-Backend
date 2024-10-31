const User = require("../../../models/userModels");
const jwt = require("jsonwebtoken");
const loginAsUser = async (req, res) => {
  const { userId, uid } = req.body;
  //validate userID and uid
  if (!userId || !uid) {
    res.status(400).json({ error: "Both uid and userId are required" });
  }
  const foundUser = await User.findOne({ _id:userId, uid });
  if (!foundUser) {
    return res
      .status(400)
      .json({ error: "User does not exist with these credentials" });
  }
  const token = jwt.sign({ userId, uid }, process.env.JWT_SECRET);
  res.status(200).json({ message: "Logged in as user successfully", token });
};
module.exports = loginAsUser;
