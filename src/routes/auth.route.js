const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth.controller');
// const { validateToken } = require('../middlewares/AuthMiddleware');

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/verify/:token', authController.verifyEmail);

module.exports = authRouter;