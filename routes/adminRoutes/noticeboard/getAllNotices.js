const Notice = require("../../../models/notices");
const getAllNotices = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    //Fetch partial data from database
    const paginatedNotices = await Notice.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalNotices = await Notice.countDocuments();

    res.status(200).json({
      paginatedNotices,
      totalNotices,
      currentPage: page,
      totalPages: Math.ceil(totalNotices / limit),
    });
  } catch (error) {
    let parsedError = { status: 500, message:error.message };

    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getAllNotices;
