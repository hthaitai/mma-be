const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const crypto = require('crypto');
const transporter = require('../configs/emailConfig');

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
        const { name, email, password } = req.body;
        const existUser = await User.findOne({ email })
        if (existUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        //Token xác thực
        const vertificationToken = crypto.randomBytes(32).toString('hex');
        const newuser = new User({
            name,
            email,
            password,
            vertificationToken
        });

        await newuser.save();
        // Tạo link xác thực
        const verificationLink = `http://localhost:${process.env.PORT}/api/auth/verify/${vertificationToken}`;// sẽ sửa lại verificationLink khi có front-end fogetpassword
        // Gửi email xác thực
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Xác thực tài khoản',
            html: `
                <!DOCTYPE html>
                <html>
                    <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #2C3E50; text-align: center; margin-bottom: 20px; font-size: 24px;">Xin chào ${name}!</h2>
                            <div style="color: #666; line-height: 1.6; font-size: 16px;">
                                <p style="margin-bottom: 15px;">Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào nút bên dưới để xác thực tài khoản của bạn:</p>
                                <div style="text-align: center; margin: 25px 0;">
                                    <a href="${verificationLink}" 
                                    style="background-color: #3498DB; 
                                            color: white; 
                                            padding: 12px 30px; 
                                            text-decoration: none; 
                                            border-radius: 5px; 
                                            font-weight: bold;
                                            display: inline-block;">
                                        Xác thực tài khoản
                                    </a>
                                </div>
                                <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">Link này sẽ hết hạn sau 24 giờ.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu xác thực này, vui lòng bỏ qua email này.</p>
                            </div>
                        </div>
                    </body>
                </html>
            `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
        })

        return res.status(201).json({ message: 'User created successfully, please check your email to verify your email account' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//Verify email
module.exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ vertificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        user.isVerified = true;
        user.vertificationToken = null;
        await user.save();

        return res.status(200).json({
            message: 'Email verified successfully'
        });
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

        // Kiểm tra xác thực email
        if (!user.isVerified) {
            return res.status(400).json({
                message: 'Email not verified',
                verificationLink: `http://localhost:${process.env.PORT}/api/auth/verify/${user.vertificationToken}`// sẽ sửa lại verificationLink khi có front-end fogetpassword
            })
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
                id: user._id,
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
// Forget password
module.exports.fogotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const ressetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });

        user.ressetPasswordToken = ressetToken;
        user.ressetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetLink = `http://localhost:${process.env.PORT}/api/auth/resset-password/${ressetToken}`; // sẽ sửa lại resetLink khi có front-end fogetpassword
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Đặt lại mật khẩu',
            html: `
            <!DOCTYPE html>
            <html>
                <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #2C3E50; text-align: center; margin-bottom: 20px; font-size: 24px;">Xin chào ${user.name}!</h2>
                        <div style="color: #666; line-height: 1.6; font-size: 16px;">
                            <p style="margin-bottom: 15px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${resetLink}" 
                                   style="background-color: #3498DB; 
                                          color: white; 
                                          padding: 12px 30px; 
                                          text-decoration: none; 
                                          border-radius: 5px; 
                                          font-weight: bold;
                                          display: inline-block;">
                                    Đặt lại mật khẩu
                                </a>
                            </div>
                            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">Link này sẽ hết hạn sau 10 phút.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        </div>
                    </div>
                </body>
            </html>
        `
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
        })

        return res.status(200).json({
            message: 'Email sent successfully'
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// Resset password 
module.exports.ressetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            _id: decoded.id,
            ressetPasswordToken: token,
            ressetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token or token has expried' });
        }

        user.password = newPassword;

        user.ressetPasswordToken = undefined;
        user.ressetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}