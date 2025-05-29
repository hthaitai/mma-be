// routes/coachRoutes.js
const express = require('express');
const coachRouter = express.Router();
const coachController = require('../controllers/coachProfile.controller');
const { validateToken } = require('../middlewares/AuthMiddleware');
const  checkCoach  = require('../middlewares/CoachMiddleware');
// Tạo hồ sơ coach
coachRouter.post('/', validateToken, checkCoach, coachController.createCoachProfile);

// Lấy tất cả coach
coachRouter.get('/', coachController.getAllCoachProfiles);

// Lấy 1 coach
coachRouter.get('/:id', coachController.getCoachProfileById);

// Cập nhật coach
coachRouter.put('/:id', coachController.updateCoachProfile);

module.exports = coachRouter;