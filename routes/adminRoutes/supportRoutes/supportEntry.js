const express = require("express");
const validateAdminToken = require("../../../middlewares/validateAdminToken");
const router = express.Router();
const Query = require("../../../models/query");

router.get("/get-all-queries", validateAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = process.env.PAGE_LIMIT;
    const queries = await Query.find({ hasSeen: false })
      .sort({ createdAt: -1 }) // Sort by creation date, most recent first
      .limit(limit)
      .select({ __v: 0, updatedAt: 0 }); // Limit the results to 10

    res.status(200).json({ message: "Queries fetched successfully", queries });
  } catch (error) {
    console.error(
      "Error occured while fetching all queries for admin : ",
      error
    );
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});
router.post(
  "/mark-query-seen/:queryId",
  validateAdminToken,
  async (req, res) => {
    const queryId = req.params.queryId;
    if (!queryId) {
      res.status(400).json({ error: "Query ID required" });
    }
    try {
      const dbQuery = await Query.findByIdAndUpdate(
        queryId,
        { hasSeen: true },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Query processed successfully", query: dbQuery });
    } catch (error) {
      console.error(
        "Error occured while fetching all queries for admin : ",
        error
      );
      res.status(500).json({ error: "INTERNAL SERVER ERROR" });
    }
  }
);
module.exports = router;
