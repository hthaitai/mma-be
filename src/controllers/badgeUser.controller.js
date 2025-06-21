const UserBadge = require('../models/userBadge.model');
const Badge = require('../models/badge.model');
const Post = require('../models/post.model');

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
            .populate('user_id', 'name email avatar_url')
            .populate('badge_id')
            .sort({ awarded_at: -1 });

        res.status(200).json(badges);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user badges', error: err.message });
    }
};
module.exports.countBadgeRecipients = async (req, res) => {
    try {
        const result = await UserBadge.aggregate([
            { $group: { _id: "$badge_id", count: { $sum: 1 } } }
        ]);

        const populated = await Badge.populate(result, { path: '_id' });
        res.status(200).json(populated);
    } catch (err) {
        res.status(500).json({ message: 'Error counting badge users', error: err.message });
    }
};

module.exports.shareUserBadge = async (req, res) => {
    try {
        const userId = req.user.id;
        const { badge_id, content, title, tags } = req.body;

        const userBadge = await UserBadge.findOne({
            user_id: userId,
            badge_id: badge_id
        });

        const badge = await Badge.findById(badge_id);

        if (!userBadge) {
            return res.status(404).json({ message: 'You do not own this badge' });
        }

        const post = new Post({
            user_id: userId,
            shared_badge_id: badge_id,
            title: title,
            content: content,
            post_type: 'badge',
            tags: tags,
            image: badge.url_image,
            reaction_count: 0,
            comment_count: 0
        });

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('user_id', 'name email avatar_url')
            .populate('shared_badge_id');

        res.status(201).json({
            message: 'Badge shared successfully',
            post: populatedPost
        });
    } catch (error) {
        console.error('Error sharing user badge:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}