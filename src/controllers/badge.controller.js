const Badge = require('../models/badge.model');

// Tạo badge
module.exports.createBadge = async (req, res) => {
    try {
        const { name, condition, tier, point_value } = req.body;

        const badge = new Badge({ name, condition, tier, point_value });
        await badge.save();

        res.status(201).json(badge);
    } catch (error) {
        res.status(500).json({ message: 'Error creating badge', error: error.message });
    }
};

// Lấy danh sách badge
module.exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find();
        res.status(200).json(badges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching badges', error: error.message });
    }
};

//Update badge
module.exports.updateBadge = async (req, res) => {
    try {
        const badgeId = req.params.id;
        const { name, condition, tier, point_value } = req.body;
        const badge = await Badge.findByIdAndUpdate(badgeId, { name, condition, tier, point_value }, { new: true });
        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }
        return res.status(200).json({ message: 'Badge updated successfully', badge });

    } catch (error) {
        res.status(500).json({ message: 'Error update badge', error: error.message });
    }
};

//Delete badge
module.exports.deleteBadge = async (req, res) => {
    try {
        const badgeId = req.params.id;
        const badge = await Badge.findByIdAndDelete(badgeId);

        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' })
        }
        return res.status(200).json({ message: 'Badge deleted successfully', badge })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Error delete badge', error: error.message })
    }
}
