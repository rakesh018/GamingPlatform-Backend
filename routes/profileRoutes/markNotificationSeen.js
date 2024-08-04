const Notification = require("../../models/notificationModel");
const markNotificationSeen = async (req, res) => {
  try {
    const userId = req.userId; //from token validation
    if (!req.body?.notificationId) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Notification id required" })
      );
    }
    const { notificationId } = req.body; //expect notification id

    //mark this notification seen and fetch top 10 notifications again
    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: notificationId },
      { hasSeen: true },
      { new: true }
    );
    if (!updatedNotification) {
      throw new Error(
        JSON.stringify({ status: 400, message: "Notification does not exist" })
      );
    }
    //fetch notifications again
    const notifications = await Notification.find({ userId, hasSeen: false })
      .sort({ createdAt: -1 }) // Sort by creation date, most recent first
      .limit(10)
      .select({ __v: 0, updatedAt: 0 }); // Limit the results to 10

    res
      .status(200)
      .json({ message: "Notification marked seen", notifications });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    console.error("Error occurred during marking notification as seen : ", error);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};
module.exports = markNotificationSeen;
