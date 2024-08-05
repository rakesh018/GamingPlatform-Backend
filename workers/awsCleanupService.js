const s3 = require("../configs/awsConfig");
const ManualDeposit = require("../models/manualDeposit");

// Helper function to delete a file from S3
const deleteFileFromS3 = async (s3Key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: s3Key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error(`Error deleting ${s3Key} from S3:`, error);
  }
};

// Main cleanup function
const cleanupAWS = async () => {
  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // Date 10 days ago

    // Fetch entries older than 10 days with status completed or rejected
    const oldEntries = await ManualDeposit.find({
      status: { $in: ["completed", "rejected"] },
      updatedAt: { $lt: tenDaysAgo },
    }).exec();

    console.log(`Found ${oldEntries.length} entries to clean up`);

    // Delete files from S3
    for (const entry of oldEntries) {
      await deleteFileFromS3(entry.s3Key);
      entry.isCleanedUp=true;
      await entry.save();
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};

module.exports =  cleanupAWS ;