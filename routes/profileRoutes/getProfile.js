const User = require("../../models/userModels");
const Notification=require('../../models/notificationModel')
const getProfile = async (req, res) => {
  const userId = req.userId; //got this from validate Token middleware

  try {
    const getUserFromDB = await User.findById(userId).select(
      "_id phone email uid balance withdrawableBalance referralCode"
    );
    if (!getUserFromDB) {
      res.status(404).json({ error: "USER NOT FOUND ERROR" });
    }
    const redDot=await Notification.exists({userId:userId,hasSeen:false}); //check if any unread notification exists
    const totalBalance =
      getUserFromDB.balance + getUserFromDB.withdrawableBalance;
    res.status(200).json({
      _id: getUserFromDB._id,
      email: getUserFromDB.email,
      phone: getUserFromDB.phone,
      uid: getUserFromDB.uid,
      balance: totalBalance,
      withdrawableBalance:getUserFromDB.withdrawableBalance,
      referralCode: getUserFromDB.referralCode,
      redDot
    });
  } catch (err) {
    console.log(`Error getting Profile Details : ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = getProfile;
