const User = require("../../../models/userModels");
const Notice = require("../../../models/notices")
const deleteNotice = async (req, res) => {
  try {
    const uid = parseInt(req.params.uid)

   
    // Deleting notice directly
    const result = await Notice.deleteOne({ uid });

    // Check if the notice was deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No notice found to delete" });
    }

    res.status(200).json({
      message:"Notice Deleted Successfylly"
    });

  } catch (error) {
    let parsedError = { status: 500, message: error.message };

    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = deleteNotice;
