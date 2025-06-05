const Feedback = require('../models/feedback.model');

module.exports.createFeedback = async (req, res) => {
    try {
        const user_id = req.user.id; // Lấy user_id từ token đã xác thực

        const { plan_id, coach_id, rating, feedback_type, content } = req.body;

        // Xác thực luồng đúng với từng loại
        if (feedback_type === 'user_to_coach' && !coach_id) {
            return res.status(400).json({ error: 'Coach ID is required for user_to_coach feedback' });
        }

        if (feedback_type === 'user_to_plan' && !plan_id) {
            return res.status(400).json({ error: 'Plan ID is required for user_to_plan feedback' });
        }
        // Validate required fields
        if (!user_id || !feedback_type) {
            return res.status(400).json({ error: 'User ID and feedback type are required.' });
        }

        const feedback = new Feedback({
            user_id,
            plan_id,
            coach_id,
            rating,
            feedback_type,
            content
        });

        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getFeedbackbyUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const feedbacks = await Feedback.find({
            userId
        }).populate('user_id coach_id');

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback by user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getCoachFeedback = async (req, res) => {
    try {
        const coachId = req.params.id;

        // Lấy tất cả phản hồi mà coach đã gửi cho người dùng
        const feedbacks = await Feedback.find({ coachId })
            .populate('user_id');

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching coach feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;

        // Tìm và xóa phản hồi
        const feedback = await Feedback.findByIdAndDelete(feedbackId);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updateFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const { rating, content } = req.body;

        // Cập nhật phản hồi
        const feedback = await Feedback.findByIdAndUpdate(feedbackId, { rating, content }, { new: true });

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json(feedback);
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCoachAverageRating = async (req, res) => {
    try {
        const coachId = req.params.id;

        const result = await Feedback.aggregate([
            { $match: { coachId, feedback_type: 'user_to_coach' } },
            {
                $group: {
                    _id: '$coach_id',
                    averageRating: { $avg: '$rating' },
                    totalFeedbacks: { $sum: 1 }
                }
            }
        ]);

        if (result.length === 0) return res.status(404).json({ message: 'No feedback found' });

        res.status(200).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
