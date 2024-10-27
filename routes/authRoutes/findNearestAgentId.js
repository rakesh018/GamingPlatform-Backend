const User = require("../../models/userModels");
const findAgentInTree = async (userId) => {
  //we can go max upto 3 levels in parent tree
  let currentLevelDocument = await User.findOne({ _id: userId });
  if (!currentLevelDocument.referredBy) {
    //there is no even immediate parent
    return null;
  }

  for (let i = 0; i < 3; i++) {
    currentLevelDocument = await User.findOne({
      _id: currentLevelDocument.referredBy,
    });
    if (currentLevelDocument.userType === "agent") {
      return currentLevelDocument._id;
    } else if (!currentLevelDocument.referredBy) {
      return null;
    }
  }
};
module.exports = findAgentInTree;
