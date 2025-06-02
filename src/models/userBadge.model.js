const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
    user_id: { type: String, ref: 'User', required: true },
    badge_id: { type: String, ref: 'Badge', required: true },
    date_awarded: { type: Date, default: Date.now },
    url_image: {type: String}
}, {timestamps: true});

userBadgeSchema.index({ user_id: 1, badge_id: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);
module.exports = UserBadge;