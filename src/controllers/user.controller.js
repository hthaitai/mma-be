const User = require('../models/user.model');

// Get all users 
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            return res.status(404).json({ message: 'No users found' });
        } else {
            return res.status(200).json({
                message: 'Get all users successfully',
                users: users.map(user => {
                    return {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        avatar_url: user.avatar_url,
                        isVerified: user.isVerified
                    }
                })
            })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// Get user by id
module.exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(200).json({
            message: 'Get user successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// update user 
module.exports.updateUser = async (req, res) => {
    try {
        const userID = req.params.id;
        const { name, role, avatar_url } = req.body;
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: error.message });
        }
        user.name = name;
        user.role = role;
        user.avatar_url = avatar_url;
        await user.save();
        return res.status(200).json({
            message: 'Update user successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// delete user
module.exports.deleteUser = async (req, res) => {
    try {
        const userID = req.params.id;
        const user = await User.findByIdAndDelete(userID);
        if (!user) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(200).json({
            message: 'Delete user successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//edit profile
module.exports.editProfile = async (req, res) => {
    try {
        const userID = req.user.id;
        const { name, avatar_url } = req.body;
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: error.message });
        }
       
        user.name = name;
        user.avatar_url = avatar_url;
        await user.save();
        return res.status(200).json({
            message: 'Edit profile successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
