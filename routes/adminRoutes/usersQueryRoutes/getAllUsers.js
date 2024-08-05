const User = require("../../../models/userModels");
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;

    //Fetch partial data from database
    const paginatedUsers = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("_id phone email uid isVerified isRestricted createdAt balance withdrawableBalance");

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      paginatedUsers,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
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

module.exports = getAllUsers;
