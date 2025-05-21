const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

//Create token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            avatar_url: user.avatar_url
        },
        process.env.JWT_SECRET,
        {
            expiresIn: maxAge
        }
    );
}
// Register a new user
module.exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existUser = await User.findOne({ email })
        if (existUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newuser = new User(req.body);
        await newuser.save();
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Login a user
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = createToken(user);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.status(200).json({
            message: 'Login successful',
            user: {
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url,
                token: token
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
