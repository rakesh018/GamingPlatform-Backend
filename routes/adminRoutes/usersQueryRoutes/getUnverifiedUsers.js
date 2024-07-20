const User = require("../../../models/userModels");

const getUnverifiedUsers = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    //Fetch partial data from database
    const paginatedUnverifiedUsers = await User.find({isVerified:false})
      .skip((page - 1) * limit)
      .limit(limit)
      .select("_id phone createdAt balance");

    const totalUnverifiedUsers = await User.countDocuments({isVerified:false});

    res.status(200).json({
      paginatedUnverifiedUsers,
      totalUnverifiedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUnverifiedUsers / limit),
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

module.exports = getUnverifiedUsers;
