const {getCachedAnalytics} = require("../../workers/analyticsService");
const getAnalytics = async (req, res) => {
  try {
    const type = req.params?.type;
    if (type != "monthly-analytics" && type != "annual-analytics") {
      throw new Error(
        JSON.stringify({ status: 400, message: `INVALID ANALYTICS TYPE` })
      );
    }
    const analyticsData = await getCachedAnalytics(type);
    res
      .status(200)
      .json({ message: `${type} fetched successfully`, analyticsData });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
    }
    console.error('error occured during fetchign analytics',error);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};
module.exports = getAnalytics;
