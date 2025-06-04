const Comment = require('../models/comment.model');
const Post = require('../models/post.model');

module.exports.addComment = async (req, res) => {
    try {
        const { post_id, comment_text } = req.body;
        const user_id = req.user.id;

        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const comment = new Comment({
            post_id,
            user_id,
            comment_text,
        });

        await comment.save();
        // Tăng số lượng comment trong Post
        await Post.findByIdAndUpdate(post_id, { $inc: { comment_count: 1 } });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getCommentsByPostId = async (req, res) => {
    try {
        const post_id = req.params.id;

        const comments = await Comment.find({ post_id })
            .populate('user_id', 'name avatar_url') // Lấy thông tin người dùng
            .sort({ comment_date: -1 }); // Sắp xếp theo ngày bình luận mới nhất

        res.status(200).json(comments);

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updateComment = async (req, res) => {
    try {
        const comment_id = req.params.id;
        const { comment_text } = req.body;
        const user_id = req.user.id;

        const comment = await Comment.findById(comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user_id.toString() !== user_id) {
            return res.status(403).json({ message: 'You are not authorized to update this comment' });
        }

        comment.comment_text = comment_text;
        await comment.save();
        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.deleteComment = async (req, res) => {
    try {
        const comment_id = req.params.id;
        const user_id = req.user.id;

        const comment = await Comment.findById(comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user_id.toString() !== user_id) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(comment_id);
        // Giảm số lượng comment trong Post
        await Post.findByIdAndUpdate(comment.post_id, { $inc: { comment_count: -1 } });

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
