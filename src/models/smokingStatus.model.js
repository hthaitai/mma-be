const mongoose = require('mongoose');
const statusSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // frequency: {
    //     type: String,
    //     required: true,
    //     enum: ['daily', 'weekly', 'occasionally', 'social'], // danh sách giá trị cho phép
    // },
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
        max: 1000000,
    },
    start_date: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

const SmokingStatus = mongoose.model('SmokingStatus', statusSchema);
module.exports = SmokingStatus;