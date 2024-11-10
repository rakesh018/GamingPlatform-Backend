const User = require('../../models/userModels');
const Bet=require('../../models/betModel');

const runScript = async (req, res) => {
  try {
    // Update all documents in the User collection, setting 'nearestAgentId' to null
    const result = await Bet.updateMany({}, { $set: { betStatus: "completed" } });
    
    res.json({
      message: 'New field added to all bets',
      modifiedCount: result.modifiedCount, // How many documents were updated
    });
  } catch (error) {
    console.error('Error updating documents:', error);
    res.status(500).json({ message: 'Failed to update documents', error: error.message });
  }
};

module.exports = runScript;
