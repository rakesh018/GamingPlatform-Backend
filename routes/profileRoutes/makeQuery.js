const Query = require("../../models/query");

const makeQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.length > 500) {
      return res.status(400).json({ error: "Invalid query" });
    }
    const userId = req.userId;
    const newQuery = new Query({ userId, message: query });
    await newQuery.save();
    res.json({message:'Query made successfully'});
  } catch (error) {
    console.error(`Error making query to admin `, error);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};
module.exports = makeQuery;
