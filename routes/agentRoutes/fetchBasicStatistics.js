const User = require('../../models/userModels');
const Bet = require('../../models/betModel'); // Assuming the model is named betModels

const fetchBasicStatistics = async (req, res) => {
    try {
        const userId = req.agentId;
        
        const fetchedProfile=await User.findOne({_id:userId});
        
        // Fetch the count of invited users
        const invited = await User.countDocuments({ nearestAgentId: userId });

        // Calculate total income and last 30 days income
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch only required fields from bets handled by the agent
        const bets = await Bet.find({
            handledBy: userId
        }).select('betAmount isWin createdAt'); // Only fields needed for calculations

        let totalIncome = 0;
        let monthlyIncome = 0;

        bets.forEach(bet => {
            const profitOrLoss = bet.isWin ? -bet.betAmount : 0.8 * bet.betAmount;
            totalIncome += profitOrLoss;

            // Calculate monthly income only for bets within the last 30 days
            if (bet.createdAt >= thirtyDaysAgo) {
                monthlyIncome += profitOrLoss;
            }
        });
        totalIncome=parseFloat(totalIncome.toFixed(1));
        monthlyIncome=parseFloat(monthlyIncome.toFixed(1));
        res.status(200).json({
            profile: fetchedProfile,
            invited,
            totalIncome,
            monthlyIncome
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = fetchBasicStatistics;
