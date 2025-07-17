const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const maxAge = 3 * 24 * 60 * 60;
const createToken = (user) => {
  return jwt.sign({
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role
  }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing name, email, or password' });

    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ message: 'Email already registered' });

    const newUser = new User({ name, email, password });
    await newUser.save();

    const token = createToken(newUser);
    return res.status(201).json({
      message: 'Register successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Email not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = createToken(user);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership,
        token
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
