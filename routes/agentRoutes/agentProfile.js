const User = require("../../models/userModels");

const fetchAgentProfile = async (req, res) => {
  const agentId = req.agentId;
  //fetch profile
  try {
    const user = await User.findOne({ _id: agentId });
    res.status(200).json(user);
  } catch (error) {
    console.error(`Error sending profile details to agent : ${error}`);
    res.status(500).json({ error: "Error fetching profile" });
  }
};

module.exports = fetchAgentProfile;
