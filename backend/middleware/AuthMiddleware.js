const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied !" });
    }
    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), secretKey);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid Token" });
    }
};

const authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden! You don't have access" });
        }
        next();
    };
};

module.exports = { verifyToken, authorizedRoles };