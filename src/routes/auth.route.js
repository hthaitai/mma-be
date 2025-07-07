const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth.controller');
// const { validateToken } = require('../middlewares/AuthMiddleware');

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/verify/:token', authController.verifyEmail);
authRouter.post('/fogot-password', authController.fogotPassword);
authRouter.post('/resset-password/:token', authController.ressetPassword);
authRouter.post('/google', authController.googleAuth);
//register for mobile
authRouter.post('/register/send-otp', authController.registerSendOtp);
authRouter.post('/verify-otp', authController.verifyEmailWithOtp);
//reset password for mobile
authRouter.post('/request-password-reset', authController.requestPasswordReset);
authRouter.post('/verify-reset-otp', authController.verifyResetOtp);
authRouter.post('/reset-password', authController.resetPasswordMobile);

module.exports = authRouter;