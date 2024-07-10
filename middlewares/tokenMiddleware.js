const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1]; //'Bearer token
    if (!token) {
        return res.status(401).json({ error: 'ACCESS DENIED, NO TOKEN PROVIDED' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.log(`Error occured while validating token : ${err}`);
        res.status(400).json({ error: 'INVALID TOKEN.PLEASE LOGIN' });
    }
};

module.exports=validateToken;
