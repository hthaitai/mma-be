const mongoose = require('mongoose');

const meetSessionSchema = new mongoose.Schema({
    member_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coach_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    schedule_at: { type: Date, required: true },
}, { timestamps: true });

const MeetSession = mongoose.model('MeetSession', meetSessionSchema);
module.exports = MeetSession;