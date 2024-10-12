const Notice = require("../../models/notices");

const getAllNotices = async (req, res) => {
  try {
    const Notices = await Notice.find()
      .sort({ createdAt: -1 }) // Sort by creation date, most recent first
      .limit(10)
    //   .select({ __v: 0, updatedAt: 0 }); 
    console.log(Notices);
    res.status(200).json({ message: "Notices fetched successfully", Notices });
  } catch (error) {
    console.error("Error occured while fetching all notices: ", error);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};
module.exports = getAllNotices;
