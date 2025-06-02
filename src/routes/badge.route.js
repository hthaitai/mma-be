const express = require('express');
const badgeController = require('../controllers/badge.controller');
const badgeRouter = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');

badgeRouter.post('/create', validateToken, badgeController.createBadge);
badgeRouter.get('/', validateToken, badgeController.getAllBadges);

module.exports = badgeRouter;