const SmokingStatus = require('../models/smokingStatus.model');
const User = require('../models/user.model');
module.exports.createSmokingStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } else {
            const { smokingStatus } = req.body;
            const newSmokingStatus = new SmokingStatus({ smokingStatus });
            await newSmokingStatus.save();
            res.status(200).json({ message: 'Smoking status created successfully' });
        }
    } catch (error) {
        console.log(error.message);
    }
}