const Chat = require("../../models/chatModel");

const fetchAllChatsForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;

    // Step 1: Count the total number of distinct senders
    const totalSendersCount = await Chat.aggregate([
      {
        $match: {
          receiver: "admin",
        },
      },
      {
        $group: {
          _id: "$sender",
        },
      },
      {
        $count: "totalSenders",
      },
    ]);

    const totalSenders = totalSendersCount.length > 0 ? totalSendersCount[0].totalSenders : 0;
    const totalPages = Math.ceil(totalSenders / limit);

    // Step 2: Aggregate all chats with pagination
    const allChats = await Chat.aggregate([
      {
        $match: {
          receiver: "admin",
        },
      },
      {
        $group: {
          _id: "$sender",
          uid: { $last: "$uid" },
          unseenCount: {
            $sum: { $cond: [{ $eq: ["$hasSeen", false] }, 1, 0] },
          },
          mostRecentMessage: { $last: "$message" },
          lastMessageTime: { $last: "$createdAt" },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    if (!allChats || allChats.length === 0) {
      return res.status(200).json({ message: "No messages found" });
    }

    // Format the result
    const result = allChats.map((chat) => ({
      sender: chat._id,
      uid: chat.uid,
      unseenCount: chat.unseenCount,
      recentMessagePreview: chat.mostRecentMessage,
      lastMessageTime: chat.lastMessageTime,
    }));

    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      chats: result,
    });
  } catch (error) {
    console.error("Error fetching chats for admin: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = fetchAllChatsForAdmin;
