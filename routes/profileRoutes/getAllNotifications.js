const Notification = require("../../models/notificationModel");

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ userId, hasSeen: false })
      .sort({ createdAt: -1 }) // Sort by creation date, most recent first
      .limit(10).select({_id:0,__v:0,updatedAt:0}); // Limit the results to 10

    res
      .status(200)
      .json({ message: "Notification fetched successfully", notifications });
  } catch (error) {
    console.error('Error occured while fetching all notifications for a user : ',error);
    res.status(500).json({error:'INTERNAL SERVER ERROR'});
  }
};
module.exports=getAllNotifications;
