// Validation middleware

//Used in makeAutoPayment to validate the inputs received from frontend
const {body,validationResult}=require('express-validator');
const validateAutoPayment = [
    body("phoneNumber").isNumeric().withMessage("INVALID PHONE NUMBER ERROR"),
    body("amount")
        .isFloat({ min: 10, max: 100000 })
        .withMessage("INVALID AMOUNT ERROR"),
    body("type")
        .isString()
        .isIn(["deposit", "withdrawal"])
        .withMessage("INVALID TRANSACTION TYPE ERROR"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //throw error with above mentioned error message
            return res.status(400).json({ error: errors.array()[0].msg });
        } else {
            next();
        }
    },
];
module.exports = validateAutoPayment;
