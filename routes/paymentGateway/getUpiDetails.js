const Admin = require("../../models/admin");

const getUpiDetails = async (req, res) => {
  try {
    const upiDetails = await Admin.findOne();
    if (!upiDetails) {
      return res.status(404).json({ error: 'UPI details not found' });
    }
    
    const upiId = upiDetails.upi;
    const qrKey = upiDetails.qr;
    
    // Send the UPI details as a JSON response
    res.json({ 
      upiId, 
      qrCode: `https://upi-qrs.s3.ap-south-1.amazonaws.com/${qrKey}` // Removed the extra semicolon here
    });
  } catch (error) {
    console.error('Error sending UPI details to admin', error);
    res.status(500).json({ error: 'Error fetching UPI details' });
  }
};

module.exports = getUpiDetails;
