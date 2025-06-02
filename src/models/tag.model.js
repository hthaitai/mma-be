const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    title: String,
    description: String
}, { timestamps: true });

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
