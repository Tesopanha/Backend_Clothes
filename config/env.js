require('dotenv').config();

module.exports = {
    dbUri: process.env.DB_URI,
    jwtSecret: process.env.JWT_SECRET,
    port: process.env.PORT || 3000,
};