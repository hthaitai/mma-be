const mongoose = require('mongoose');
const statusSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    frequency: {
        type: Number,
        required: true,
        min: 0,
        max: 1000,
    },
    cigarettes_per_day: {
        type: Number,
        required: true,
        min: 0,
        max: 1000,
    },
    cost_per_pack: {
        type: Number,
        required: true,
        min: 0,
        max: 1000,
    },
    start_date: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

const SmokingStatus = mongoose.model('SmokingStatus', statusSchema);
module.exports = SmokingStatus;