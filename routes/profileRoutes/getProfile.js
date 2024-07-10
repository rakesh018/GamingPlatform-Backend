const User=require('../../models/userModels');
const getProfile=async (req, res) => {

    const userId = req.userId; //got this from validate Token middleware

    try {
        const getUserFromDB = await User.findById(userId).select('phone email balance isRestricted');
        if (!getUserFromDB) {
            res.status(404).json({ error: 'USER NOT FOUND ERROR' });
        }
        res.status(200).json(getUserFromDB);
    } catch (err) {
        console.log(`Error getting Profile Details : ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
module.exports=getProfile;