const Chat = require("../../models/chatModel");

const fetchChatForAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      throw new Error(JSON.stringify({ message: "UserID not found" ,status:400}));
    }
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
    console.error("Error during fetching chat for admin ", error);
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (parseError) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = fetchChatForAdmin;
