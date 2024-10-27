const { body, validationResult } = require("express-validator");
const s3 = require("../../configs/awsConfig");
const { v4: uuidv4 } = require("uuid");

// List of allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const generatePSUForAgent = [
  // Validation middleware
  body("fileName").notEmpty().withMessage("File name is required"),
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
      const { fileName, fileType} = req.body;
      const uniqueId = uuidv4();
      const fType=fileType.split("/")[1]; //will get only specific file type like png,jpg etc
      const objectKey = `${req.agentId}/${uniqueId}.${fType}`; // Generate a unique identifier and include fileName in the key

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: objectKey,
        ContentType: fileType,
        ACL: "private",
        Expires: 60 * 5, // URL valid for 5 minutes
      };

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
      console.error(`Error generating pre signed url : ${error}`);
      res.status(parsedError.status).json({ error: parsedError.message });
    }
  },
];

module.exports = generatePSUForAgent;
