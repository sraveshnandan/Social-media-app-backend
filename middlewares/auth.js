const User = require("../models/User");
const jwt = require("jsonwebtoken");
exports.isAuthenticated = async (req, res, next) => {
    try {
        const { token, userid } = req.cookies;
        if (!token && !userid) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }
        const decoded_data = await jwt.verify(token, process.env.JWT_PRIVET_KEY);
        if (!decoded_data) {
            return res.status(409).json({
                success: false,
                message: "Invalid Auth Token, Please login!"
            })
        }
        req.user = await User.findById(decoded_data._id);
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};