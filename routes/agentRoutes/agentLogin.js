const { body, validationResult } = require("express-validator");
const User=require('../../models/userModels');
const jwt=require('jsonwebtoken')

// Middleware to handle agent login
const handleAgentLogin = [
  // Validation rules
  body("emailOrPhone").notEmpty().withMessage("EMAIL OR PHONE REQUIRED ERROR"),
  body("password").notEmpty().withMessage("PASSWORD NOT PRESENT ERROR"),
  // Controller function
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0].msg });
    }

    try {
      // Extract email and password from request body
      const { emailOrPhone, password } = req.body;

      const agent = await User.findOne({
        $and: [
          { userType: "agent" },
          { $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] },
        ],
      });
      if (!agent || agent.is) {
        return res.status(400).json({ error: "Agent account does not exist." });
      } else if (password !== agent.password) {
        return res.status(400).json({ error: "Incorrect password" });
      }

      const agentToken = jwt.sign(
        { agentId: agent._id, agentUID: agent.uid },
        process.env.AGENT_JWT_SECRET
      );

      res.status(200).json({ message: "Sign-in successful", agentToken });

    } catch (error) {
      // Handle unexpected errors
      console.error("Error in handleAgentLogin:", error);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  },
];

module.exports = handleAgentLogin;  
