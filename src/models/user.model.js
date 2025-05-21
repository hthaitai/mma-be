const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'coach'],
        default: 'user',
    },
    avatar_url: {
        type: String,
        default: 'https://example.com/default-avatar.png',
    },
    vertificationToken: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, 
{
    timestamps: true,
});
// Hash password before saving to database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// Compare password with hashed password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
