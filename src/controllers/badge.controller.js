const Badge = require('../models/badge.model');

// Tạo badge
module.exports.createBadge = async (req, res) => {
    try {
        const { name, condition, tier, point_value } = req.body;

        const badge = new Badge({ name, condition, tier, point_value });
        await badge.save();

        res.status(201).json(badge);
    } catch (err) {
        res.status(500).json({ message: 'Error creating badge', error: err.message });
    }
};

// Lấy danh sách badge
module.exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find();
        res.status(200).json(badges);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching badges', error: err.message });
    }
};
