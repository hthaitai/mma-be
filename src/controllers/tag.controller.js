const Tag = require('../models/tag.model');

// Tạo tag
module.exports.createTag = async (req, res) => {
    try {
        const { title, description } = req.body;

        const tag = new Tag({ title, description });
        await tag.save();

        res.status(201).json(tag);
    } catch (err) {
        res.status(500).json({ message: 'Error creating tag', error: err.message });
    }
};

// Lấy tất cả tag
module.exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find().sort({ title: 1 });
        res.status(200).json(tags);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tags', error: err.message });
    }
};