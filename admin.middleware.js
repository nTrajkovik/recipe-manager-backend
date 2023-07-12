
const isAdmin = async (req, res, next) => {
    const user = req.user;
    if (user && user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized Needs Admin" });
    }
};

module.exports = {
    isAdmin,
};