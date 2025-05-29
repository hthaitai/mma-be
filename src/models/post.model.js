const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shared_bage_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    post_date: { type: Date, default: Date.now },
    post_type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    reaction_count: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },  // tổng comment
    like_user_ids: [{ type: String, ref: 'User' }] // lưu danh sách người đã like
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;