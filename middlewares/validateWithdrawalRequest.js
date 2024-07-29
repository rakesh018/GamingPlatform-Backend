const { body, validationResult } = require("express-validator");

const validateWithdrawalRequest = [
  body("amount")
    .isFloat({ min: 100, max: 300000 })
    .withMessage("MINIMUM: 100, MAXIMUM: 300000"),
  body("bankName")
    .notEmpty()
    .withMessage("Bank name is required")
    .isString()
    .withMessage("Bank name must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Bank name must be between 3 and 50 characters"),
  body("accountNumber")
    .notEmpty()
    .withMessage("Account number is required")
    .isAlphanumeric()
    .withMessage("Account number must be alpha numeric")
    .isLength({ min: 9, max: 18 })
    .withMessage("Account number must be between 6 and  digits"),
  body("ifscCode")
    .notEmpty()
    .withMessage("IFSC code is required")
    .isAlphanumeric()
    .withMessage("IFSC code must be alphanumeric")
    .isLength({ min: 11, max: 11 })
    .withMessage("IFSC code must be 11 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    } else {
      next();
    }
  },
];

module.exports = validateWithdrawalRequest;
