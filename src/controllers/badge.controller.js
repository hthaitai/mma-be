const Badge = require('../models/badge.model');
const UserBadge = require('../models/userBadge.model');

// Tạo badge
module.exports.createBadge = async (req, res) => {
    try {
        const { name, condition, tier, point_value, url_image } = req.body;

        const badge = new Badge({ name, condition, tier, point_value, url_image });
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
        const { name, condition, tier, point_value, url_image } = req.body;
        const badge = await Badge.findByIdAndUpdate(badgeId, { name, condition, tier, point_value, url_image }, { new: true });
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
};


// GET /api/badges/user/:userId
module.exports.getAllBadgesWithUserStatus = async (req, res) => {
    const userId = req.params.id;

    try {
        const allBadges = await Badge.find();
        const userBadges = await UserBadge.find({ user_id: userId });

        // Tạo map các badge đã đạt
        const earnedBadgeMap = userBadges.reduce((ern, ub) => {
            ern[ub.badge_id.toString()] = true;
            return ern;
        }, {});

        // Trộn badge + trạng thái
        const result = allBadges.map(badge => ({
            ...badge.toObject(),
            earned: !!earnedBadgeMap[badge._id.toString()],
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.getBadgeLeaderBoard = async (req, res) => {
    try {
        const userBadges = await UserBadge.find().populate('badge_id').populate('user_id');
        const leaderBoardMap = {};

        userBadges.forEach(ub => {
            const userId = ub.user_id;
            const badge = ub.badge_id;

            if (!leaderBoardMap[userId]) {
                leaderBoardMap[userId] = {
                    userId: ub.user_id,
                    name: ub.user_id.name,
                    avatar: ub.user_id.avatar_url,
                    badgeCount: 0,
                    totalPoints: 0,
                    badges: []
                };
            }

            leaderBoardMap[userId].badgeCount += 1;
            leaderBoardMap[userId].totalPoints += badge.point_value || 0;
            leaderBoardMap[userId].badges.push({
                badge_id: badge.id,
                name: badge.name,
                point_value: badge.point_value,
            });
        });

        const leaderboard = Object.values(leaderBoardMap).sort((a, b) => b.totalPoints - a.totalPoints);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error generating leaderboard:', error.message);
        res.status(500).json({ message: 'Failed to generate leaderboard', error: error.message });
    }
};

module.exports.getBadgeStats = async (req, res) => {
    try {
        // Lấy tất cả badge
        const badges = await Badge.find();

        // Lấy user đã đạt từng badge (populate user)
        const badgeUsers = await UserBadge.find().populate('user_id', 'name email avatar_url').populate('badge_id', 'name tier');

        // Gom nhóm theo badge
        const badgeMap = {};
        badgeUsers.forEach(ub => {
            // Bỏ qua nếu thiếu user hoặc badge (dữ liệu lỗi)
            if (!ub.user_id || !ub.badge_id) return;

            const badgeId = ub.badge_id._id.toString();
            if (!badgeMap[badgeId]) {
                badgeMap[badgeId] = {
                    badge_id: badgeId,
                    name: ub.badge_id.name,
                    tier: ub.badge_id.tier,
                    users: []
                };
            }
            badgeMap[badgeId].users.push({
                user_id: ub.user_id._id,
                name: ub.user_id.name,
                email: ub.user_id.email,
                avatar_url: ub.user_id.avatar_url,
                date_awarded: ub.date_awarded
            });
        });

        // Đảm bảo trả về cả badge chưa ai đạt
        const result = badges.map(badge => ({
            badge_id: badge._id,
            name: badge.name,
            tier: badge.tier,
            users: badgeMap[badge._id.toString()] ? badgeMap[badge._id.toString()].users : []
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error getting badge stats', error: error.message });
    }
};