const express = require('express');
const userBadgeController = require('../controllers/badgeUser.controller');
const userBadgeRouter = express.Router();
const { validateToken, checkRole } = require('../middlewares/AuthMiddleware');

userBadgeRouter.post('/create', validateToken, checkRole(['admin', 'coach']), userBadgeController.assignBadge);
userBadgeRouter.get('/user/:id', validateToken, userBadgeController.getUserBadges);
userBadgeRouter.get('/badge-count', validateToken, checkRole(['admin', 'coach']), userBadgeController.countBadgeRecipients);
userBadgeRouter.post('/share', validateToken, userBadgeController.shareUserBadge);
module.exports = userBadgeRouter;
