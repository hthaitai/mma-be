// models/plan.model.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Tên gói phải là duy nhất
        enum: ['free', 'plus', 'premium'] // Hoặc các gói khác của bạn
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration_days: { // Thời hạn mặc định của gói tính bằng ngày
        type: Number,
        required: true,
        min: 0 // 0 cho gói miễn phí hoặc không có thời hạn
    },
    features: { // Danh sách các tính năng đi kèm gói
        type: [String], // Mảng các chuỗi, ví dụ: ['premium_articles', 'coach_access']
        default: []
    },
    description: {
        type: String,
        default: ''
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);