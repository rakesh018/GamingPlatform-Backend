const Withdrawal = require("../../../models/withdrawal");
const getParticularWithdrawal = async (req, res) => {
  try {
    const withdrawalId = req?.params?.withdrawalId;
    if (!withdrawalId) {
      throw new Error(
        JSON.stringify({ status: 400, message: `Withdrawal Id required` })
      );
    }
    const savedWithdrawal = await Withdrawal.findById(withdrawalId);
    if (!savedWithdrawal) {
      throw new Error({ status: 400, message: `Invalid withdrawal id` });
    }

    res.status(200).json({
      savedWithdrawal,
    });
  } catch (error) {
    let parsedError;
    try {
      parsedError = JSON.parse(error.message);
    } catch (e) {
      parsedError = { status: 500, message: "INTERNAL SERVER ERROR" };
    }
    console.error(`Error getting withdrawal details : ${error}`);
    res.status(parsedError.status).json({ error: parsedError.message });
  }
};

module.exports = getParticularWithdrawal;
