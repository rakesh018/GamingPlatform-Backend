const Chat = require('../../models/chatModel');

const markMessagesAsSeen = async (req, res) => {
  try {
    const { userId } = req.body; // The userId of the user whose messages you want to mark as seen
    if(!userId){
        return res.status(400).json({error:`UserID input required`});
    }
    // Update all messages from this user to admin, marking them as seen
    const result = await Chat.updateMany(
      { sender: userId, receiver: "admin", hasSeen: false }, // Find unseen messages from this user
      { $set: { hasSeen: true } } // Set them to seen
    );

    if (result.nModified === 0) {
      return res.status(200).json({ message: "No unseen messages to mark as seen" });
    }

    res.status(200).json({
      message: `Marked chat as seen`,
    });
  } catch (error) {
    console.error("Error marking messages as seen: ", error);
    res.status(500).json({ error: "Internal server error marking messages as seen" });
  }
};

module.exports = markMessagesAsSeen;
