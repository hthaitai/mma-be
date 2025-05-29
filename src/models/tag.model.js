const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    title: String,
    description: String
}, { timestamps: true });

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
