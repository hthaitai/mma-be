const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: { type: String },
    condition: { type: String },
    tier: { type: String },
    point_value: { type: Number }
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
