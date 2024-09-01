const Notification = require("../../models/notificationModel");
const getReferralCount = async (req, res) => {
  try {
    const userId = req.userId;
    const totalReferrals = await Notification.countDocuments({
      userId: userId,
      notificationType: "referral",
    });
    res.status(200).json({referralCount:totalReferrals});
  } catch (error) {
    console.error('Error occured while sending referral count to user : ',error);
    res.status(500).json({error:'INTERNAL SERVER ERROR'});
  }
};
module.exports = getReferralCount;
