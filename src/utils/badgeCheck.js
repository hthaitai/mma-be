const Badge = require('../models/badge.model');
const UserBadge = require('../models/userBadge.model');
const getUserProgressStats = require('./userStats');

const checkAndAwardBadges = async (user_id) => {
    const stats = await getUserProgressStats(user_id);
    const allBadges = await Badge.find();
    const awarded = await UserBadge.find({ user_id }).distinct('badge_id');

    for (const badge of allBadges) {
        if (awarded.map(id => id.toString()).includes(badge._id.toString())) continue;

        const condition = badge.condition;
        let achieved = false;

        try {
            const func = new Function(...Object.keys(stats), `return ${condition}`);
            achieved = func(...Object.values(stats));
        } catch (err) {
            console.error(`Lỗi điều kiện badge "${badge.name}": ${condition}`, err.message);
            continue;
        }

        if (achieved) {

            const alreadyAwarded = await UserBadge.findOne({ user_id, badge_id: badge._id });
            if (alreadyAwarded) continue;

            await UserBadge.create({
                user_id,
                badge_id: badge._id,
                url_image: badge.url_image,
            });

            console.log(`User ${user_id} đạt huy hiệu: ${badge.name} (${condition})`);
        }
    }
};

module.exports = checkAndAwardBadges;