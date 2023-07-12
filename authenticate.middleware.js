
const userService = require('./service/user.service');

const getUserFromToken = async (token) => {
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
    
    const user = await getUserFromToken(token);
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