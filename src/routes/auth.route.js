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
authRouter.post('/register/send-otp', authController.registerSendOtp);
authRouter.post('/verify-otp', authController.verifyEmailWithOtp);

module.exports = authRouter;