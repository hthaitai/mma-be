const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan', required: true }, // Optional: link to QuitPlan
    coach_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true }, // Optional: who gave feedback
    rating: { type: Number, min: 1, max: 5 },
    date: { type: Date, default: Date.now },
    feedback_type: {
        type: String,
        enum: ['user_to_coach', 'coach_to_user', 'user_to_system', 'user_to_plan'],
        required: true
    },
    content: String
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;