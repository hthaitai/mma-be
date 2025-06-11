// controllers/coachProfileController.js
const CoachProfile = require('../models/coachProfile.model');
const User = require('../models/user.model');
const Feedback = require('../models/feedback.model');

// Tạo hồ sơ huấn luyện viên mới
module.exports.createCoachProfile = async (req, res) => {
    try {
        const coach_id = req.user.id; // Lấy ID từ token đã xác thực
        const { specialization, experience_years, bio } = req.body;

        // 1. Kiểm tra user tồn tại và có role là coach
        const user = await User.findById(coach_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'coach') {
            return res.status(403).json({ message: 'User is not a coach' });
        }

        // 2. Check nếu đã có profile
        const existing = await CoachProfile.findOne({ coach_id });
        if (existing) {
            return res.status(400).json({ message: 'Coach profile already exists' });
        }

        // 3. Tạo mới profile
        const newProfile = new CoachProfile({
            coach_id,
            specialization,
            experience_years,
            bio,
            rating_avg: 0,
            total_sessions: 0
        });

        await newProfile.save();
        res.status(201).json(newProfile);
    } catch (err) {
        res.status(500).json({ message: 'Error creating coach profile', error: err.message });
    }
  };
// Lấy danh sách huấn luyện viên (có thể lọc theo chuyên môn sau này)
module.exports.getAllCoachProfiles = async (req, res) => {
    try {
        
        const profiles = await CoachProfile.find().populate('coach_id', 'name avatar_url');
        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching coach profiles', error: err.message });
    }
};

// Lấy hồ sơ chi tiết huấn luyện viên
module.exports.getCoachProfileById = async (req, res) => {
    try {
        const coachId = req.params.id;
        const profile = await CoachProfile.findOne({ coach_id: coachId }).populate('coach_id', 'name avatar_url email');

        if (!profile) return res.status(404).json({ message: 'Coach profile not found' });

        // Optionally: lấy feedback và rating
        const feedbacks = await Feedback.find({ coach_id: coachId });
        const rating_avg = feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0;

        res.status(200).json({ ...profile.toObject(), feedbacks, rating_avg });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching coach profile', error: err.message });
    }
};

// Cập nhật hồ sơ huấn luyện viên
module.exports.updateCoachProfile = async (req, res) => {
    try {
        const coachId = req.params.id;
        const updates = req.body;

        const updated = await CoachProfile.findOneAndUpdate({ coach_id: coachId }, updates, { new: true });

        if (!updated) return res.status(404).json({ message: 'Coach profile not found' });

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Error updating coach profile', error: err.message });
    }
};

// Xóa hồ sơ huấn luyện viên
module.exports.deleteCoachProfile = async (req, res) => {
    try {
        const coachId = req.params.id;
        const profile = await CoachProfile.findOneAndDelete({ coach_id: coachId });
        if (!profile) {
            return res.status(404).json({ message: 'Coach profile not found' });
        }
        res.status(200).json({ message: 'Coach profile deleted successfully', profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};