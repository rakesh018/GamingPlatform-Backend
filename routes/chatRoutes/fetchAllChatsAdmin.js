const Chat = require("../../models/chatModel");

const fetchAllChatsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;

    // Aggregate all chats (not just unseen ones)
    const allChats = await Chat.aggregate([
      {
        $match: {
          receiver: "admin",  // Admin is the receiver
        },
      },
      {
        $group: {
          _id: "$sender",  // Group by sender (user)
          uid: { $last: "$uid" },
          unseenCount: {   // Count only unseen messages
            $sum: { $cond: [{ $eq: ["$hasSeen", false] }, 1, 0] }
          },
          mostRecentMessage: { $last: "$message" }, // Preview: most recent message from each sender
          lastMessageTime: { $last: "$createdAt" }, // Time of the most recent message
        },
      },
      {
        $sort: { lastMessageTime: -1 },  // Sort by most recent message time
      },
      {
        $skip: (page - 1) * limit,  // Pagination skip
      },
      {
        $limit: limit,  // Pagination limit
      },
    ]);

    if (!allChats || allChats.length === 0) {
      return res.status(200).json({ message: "No messages found" });
    }

    // Format the result: all chats with unseen count and preview
    const result = allChats.map((chat) => ({
      sender: chat._id,  // Sender's ID (user)
      uid:chat.uid,
      unseenCount: chat.unseenCount,  // Count of unseen messages
      recentMessagePreview: chat.mostRecentMessage,  // Most recent message as preview
      lastMessageTime: chat.lastMessageTime,  // Timestamp of the most recent message
    }));

    res.status(200).json({ chats: result });
  } catch (error) {
    console.error("Error fetching chats for admin: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = fetchAllChatsForAdmin;
