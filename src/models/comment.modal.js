const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment_text: {
        type: String,
        required: true,
        trim: true,
    },
    comment_date: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;