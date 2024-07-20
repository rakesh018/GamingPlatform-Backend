const User = require("../../../models/userModels");
const getActiveUsers = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    //Fetch partial data from database
    const paginatedActiveUsers = await User.find({ isVerified: true })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("_id phone createdAt balance");

    const totalActiveUsers = await User.countDocuments({ isVerified: true });

    res.status(200).json({
      paginatedActiveUsers,
      totalActiveUsers,
      currentPage: page,
      totalPages: Math.ceil(totalActiveUsers / limit),
    });
  } catch (error) {
    let parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    console.error(
      `Error occured during fetching all users for admin : `,
      error
    );
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getActiveUsers;
