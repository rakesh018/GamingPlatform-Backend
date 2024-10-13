const { body, validationResult } = require("express-validator");
const Notice = require("../../../models/notices");
const otpGenerator = require("otp-generator");


const createNotice = async (req, res) => {
  const { notice } = req.body; // Corrected variable name
  // Generate UID function
  const generateUID = () => {
    return otpGenerator.generate(7, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
  };

  // Generate unique UID for notice
  let uid;
  let uidExists = true;
  while (uidExists) {
    // Ensure only unique UIDs exist in the database
    uid = generateUID(); // Function that generates a 7-character UID
    uidExists = await Notice.exists({ uid }); // Corrected to check Notice model, not User
  }


  // Validate notice message
  if (!notice || notice.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    const createdNotice = await Notice.create({ notice, uid });

    if (!createdNotice) {
      throw new Error("Error while creating notice");
    }

    res.status(200).json({
      message: "Notice created successfully",
    });

  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: e.message };
    }
    if (error.code === 11000) {  // Handle duplicate key error (E11000)
        const duplicateField = Object.keys(error.keyPattern)[0];
        res.status(409).json({ error: `Duplicate value for ${duplicateField}, it must be unique` });
        // res.status(500).json({ error: error.message });

      } else {
        res.status(500).json({ error: error.message });
      }
  }
};

module.exports = createNotice; // Corrected export statement
