const Feedback = require('../models/feedback.model');

module.exports.createFeedback = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { plan_id, coach_id, rating, feedback_type, content } = req.body;

        if (feedback_type === 'user_to_coach' && !coach_id) {
            return res.status(400).json({ message: 'Coach ID is required for user-to-coach feedback' });
        }

        if (feedback_type === 'user_to_plan' && !plan_id) {
            return res.status(400).json({ message: 'Plan ID is required for user-to-plan feedback' });
        }

        if (!user_id || !feedback_type) {
            return res.status(400).json({ message: 'User ID and feedback type are required' });
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
        res.status(201).json({ message: 'Feedback created successfully', feedback });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getFeedbackByUser = async (req, res) => {
    try {
        const user_id = req.user.id;
        const feedback = await Feedback.find({ user_id: user_id });
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getCoachFeedback = async (req, res) => {
    try {
        const coach_id = req.params.id;
        const feedback = await Feedback.find({ coach_id: coach_id })
            .populate('user_id', 'name email avatar_url')
            .populate('plan_id', 'name')
            .populate('coach_id', 'name email avatar_url');
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const user_id = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const feedback = await Feedback.findByIdAndDelete(feedbackId);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (!isAdmin && user_id !== feedback.user_id.toString()) {
            return res.status(401).json({ message: 'You are not authorized to delete this feedback' });
        }

        res.status(200).json({ message: 'Feedback deleted successfully', feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updateFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const { rating, content } = req.body;
        const user_id = req.user.id;
        const feedback = await Feedback.findByIdAndUpdate(feedbackId, { rating, content }, { new: true });
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (user_id !== feedback.user_id.toString()) {
            return res.status(401).json({ message: 'You are not authorized to update this feedback' });
        }

        res.status(200).json({ message: 'Feedback updated successfully', feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' })
    }
};

module.exports.getCoachAverageRating = async (req, res) => {
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

        if (result.length === 0) return res.status(200).json(result);

        const { averageRating, totalFeedbacks } = result[0];
        res.status(200).json({ averageRating, totalFeedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
module.exports.getAllFeedback = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type && type !== 'all' ? { feedback_type: type } : {};

        const feedback = await Feedback.find(filter)
            .populate('user_id', 'name email')
            .populate('coach_id', 'name')
            .populate('plan_id', 'name') // nếu muốn lấy tên kế hoạch
            .sort({ date: -1 });

        res.status(200).json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getSystemAverageRating = async (req, res) => {
    try {
        const result = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    total: { $sum: 1 }
                }
            }
        ]);

        if (!result.length) return res.status(404).json({ message: 'No feedback yet' });

        const { averageRating, total } = result[0];
        res.status(200).json({ averageRating, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatus = ['approved', 'hidden', 'pending'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const updated = await Feedback.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json({ message: 'Status updated', feedback: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
