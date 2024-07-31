const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION, REFRESH_SECRET, REFRESH_EXPIRATION } = process.env;

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};