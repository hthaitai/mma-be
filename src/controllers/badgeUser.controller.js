const UserBadge = require('../models/userBadge.model');
const Badge = require('../models/badge.model');

// Gán huy hiệu thủ công (admin hoặc coach)
module.exports.assignBadge = async (req, res) => {
    try {
        const { user_id, badge_id } = req.body;

        const userBadge = new UserBadge({ user_id, badge_id });
        await userBadge.save();

        res.status(201).json(userBadge);
    } catch (err) {
        res.status(500).json({ message: 'Error assigning badge', error: err.message });
    }
};

// Lấy danh sách huy hiệu của người dùng
module.exports.getUserBadges = async (req, res) => {
    try {
        const userId = req.params.id;

        const badges = await UserBadge.find({ user_id: userId })
            .populate('badge_id')
            .sort({ awarded_at: -1 });

        res.status(200).json(badges);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user badges', error: err.message });
    }
};
