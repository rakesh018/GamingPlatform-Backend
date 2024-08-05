const ManualDeposit = require("../../../models/manualDeposit");
const s3 = require("../../../configs/awsConfig");
const getParticularManualDeposit = async (req, res) => {
  //Create a presigned url to send to frontend to directly display the payment screenshot to admin
  try {
    const depositId = req?.params?.depositId;
    if (!depositId) {
      throw new Error(
        JSON.stringify(JSON.stringify({ status: 400, message: `Deposit Id required` }))
      );
    }
    const savedManualDeposit = await ManualDeposit.findById(depositId);
    if (!savedManualDeposit) {
      throw new Error(JSON.stringify({ status: 400, message: `Invalid deposit id` }));
    }
    if(savedManualDeposit.isCleanedUp){
      throw new Error(JSON.stringify({status:400,message:'File is deleted from storage'}));
    }
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: savedManualDeposit.s3Key,
      Expires: 60 * 2, // URL valid for 2 minutes
    };
    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        throw new Error(JSON.stringify({ status: 500, message: "AWS ERROR" }));
      }
      res.json({
        url,
        depositId,
        userId:savedManualDeposit.userId,
        uid:savedManualDeposit.uid,
        utr: savedManualDeposit.utr,
        status: savedManualDeposit.status,
        amount: savedManualDeposit.amount,
        createdAt: savedManualDeposit.createdAt,
      });
    });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    console.error(`Error generating presigned URL to send to Admin: ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getParticularManualDeposit;
