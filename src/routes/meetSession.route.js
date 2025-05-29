const express = require('express');
const routerMeetSession = express.Router();
const controller = require('../controllers/meetSession.controller');
const { validateToken } = require('../middlewares/AuthMiddleware');
const checkCoach = require('../middlewares/CoachMiddleware');

// Đặt lịch hẹn (user)
routerMeetSession.post('/', validateToken, controller.bookSession);

// Coach xem buổi hẹn của mình
routerMeetSession.get('/coach', validateToken, checkCoach, controller.getCoachSessions);

// User xem buổi hẹn của mình
routerMeetSession.get('/user', validateToken, controller.getUserSessions);

// Coach cập nhật trạng thái buổi hẹn
routerMeetSession.put('/:sessionId/status', validateToken, checkCoach, controller.updateSessionStatus);

module.exports = routerMeetSession;
