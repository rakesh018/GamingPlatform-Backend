const Admin = require("../../../models/admin");

const updateUpiDetails = async (req, res) => {
  try {
    const upiDetails = await Admin.findOne({ user: "admin" });
    if (!upiDetails) {
      return res.status(404).json({ error: "UPI details not found" });
    }
    const { upiId, qrKey } = req.body;
    if (!upiId || !qrKey) {
      return res.status(400).json({ error: "Invalid inputs" });
    }
    upiDetails.upi = upiId;
    upiDetails.qr = qrKey;
    await upiDetails.save();
    res.json({ upiId: upiDetails.upi, qrCode: `https://upi-qrs.s3.ap-south-1.amazonaws.com/${upiDetails.qr}` });
  } catch (error) {
    console.error(`Error updating upi details by admin `,error);
    res.status(500).json({error:'INTERNAL SERVER ERROR'});
  }
};
module.exports=updateUpiDetails;
