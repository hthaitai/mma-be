const express = require('express');
const userBadgeController = require('../controllers/badgeUser.controller');
const userBadgeRouter = express.Router();
const { validateToken, checkRole } = require('../middlewares/AuthMiddleware');

userBadgeRouter.post('/create', validateToken, checkRole(['admin', 'coach']), userBadgeController.assignBadge);
userBadgeRouter.get('/user/:id', validateToken, userBadgeController.getUserBadges);

module.exports = userBadgeRouter;
