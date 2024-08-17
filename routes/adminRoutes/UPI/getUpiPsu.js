const { body, validationResult } = require("express-validator");
const s3 = require("../../../configs/awsConfig");
const Admin=require('../../../models/admin')

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const generateUpiPsu = [
  // Validation middleware
  body("fileType")
    .isString()
    .withMessage("File type must be a string")
    .custom((value) => {
      if (!allowedMimeTypes.includes(value)) {
        throw new Error(
          "Invalid file type. Allowed types are: " + allowedMimeTypes.join(", ")
        );
      }
      return true;
    }),

  // Error handling middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },

  // Main handler
  async (req, res) => {
    try {
      const { fileType } = req.body;

      // Static key name for S3
      const upiDetails = await Admin.findOne({ user: 'admin' });
      if (!upiDetails) {
        return res.status(404).json({ error: 'UPI details not found' });
      }
      const upiId = upiDetails.upi;
      const qrKey = upiDetails.qr;
      const params = {
        Bucket: 'upi-qrs',
        Key: qrKey,
        ContentType: fileType,
        ACL: "private",
        Expires: 60 * 5, // URL valid for 5 minutes
      };

      // Generate presigned URL
      s3.getSignedUrl("putObject", params, (err, url) => {
        if (err) {
          throw new Error(
            JSON.stringify({ status: 500, message: "AWS ERROR" })
          );
        }
        res.json({ url, key: params.Key });
      });
    } catch (error) {
      let parsedError;
      try {
        parsedError = JSON.parse(error.message);
      } catch (e) {
        parsedError = { status: 500, message: `INTERNAL SERVER ERROR` };
      }
      console.error(`Error generating presigned URL: ${error}`);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  },
];

module.exports = generateUpiPsu;
