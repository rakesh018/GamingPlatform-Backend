const {body,validationResult}=require("express-validator");

const validateWithdrawalRequest = [
    body("amount")
        .isFloat({ min: 100, max: 300000 })
        .withMessage("MINIMUM:100,MAXIMUM:300000"),
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
module.exports = validateWithdrawalRequest;