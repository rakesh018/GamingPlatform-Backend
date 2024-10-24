const Chat = require("../../models/chatModel");

const fetchChatForUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1 } = req.query;
    const limit = 15;
    const query = {
      $or: [{ sender: userId }, { receiver: userId }],
    };
    const chats = await Chat.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalChats = await Chat.countDocuments(query);

    res.status(200).json({
      chats,
      totalPages: Math.ceil(totalChats / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(`Error fetching chats for user: `, error);
    res.status(500).json({ error: "Internal server error fetching chats" });
  }
};

module.exports = fetchChatForUser;
