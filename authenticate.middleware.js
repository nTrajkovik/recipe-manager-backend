
const userService = require('./service/user.service');
const jwt = require('jsonwebtoken');

const getUserById = async (token) => {
    try {
        const user = await userService.getById(token);
        return user;
    } catch (error) {
        console.error('Cannot get user from token', error);
    }
    return null;
};

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: "TokenExpiredError" });
    }
    console.log({decodedToken});
    const user = await getUserById(decodedToken.userId);
    console.log({user});
    if (user) {
        req.user = user;
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = {
    authenticate,
};