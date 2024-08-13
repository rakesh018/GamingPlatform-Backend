const User=require('../../models/userModels');
const getProfile=async (req, res) => {

    const userId = req.userId; //got this from validate Token middleware

    try {
        const getUserFromDB = await User.findById(userId).select('_id phone email uid balance withdrawableBalance referralCode');
        if (!getUserFromDB) {
            res.status(404).json({ error: 'USER NOT FOUND ERROR' });
        }
        const totalBalance=getUserFromDB.balance+getUserFromDB.withdrawableBalance;
        res.status(200).json({
            ...getUserFromDB._doc, // Spread the user data
            balance: totalBalance // Add the total balance
        });
    } catch (err) {
        console.log(`Error getting Profile Details : ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
module.exports=getProfile;