// middlewares/checkCoach.js
const User = require('../models/user.model');

const checkCoach = async (req, res, next) => {
    const userId = req.user.id; // req.user được gán sau khi xác thực JWT

    const user = await User.findById(userId);
    if (!user || user.role !== 'coach') {
        return res.status(403).json({ message: 'Access denied: not a coach' });
    }

    next();
};

module.exports = checkCoach;
