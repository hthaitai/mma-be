// routes/coachRoutes.js
const express = require('express');
const coachRouter = express.Router();
const coachController = require('../controllers/coachProfile.controller');
const { validateToken, checkRole } = require('../middlewares/AuthMiddleware');
const checkCoach = require('../middlewares/CoachMiddleware');

// create a new coach profile
coachRouter.post('/', validateToken, checkCoach, coachController.createCoachProfile);

// get all coach profiles
coachRouter.get('/', validateToken, checkRole(['admin', 'user']), coachController.getAllCoachProfiles);

// get one coach profile
coachRouter.get('/:id', validateToken, checkRole(['coach']), coachController.getCoachProfileById);

// Update coach profile
coachRouter.put('/:id', validateToken, checkRole(['coach']), coachController.updateCoachProfile);

// delete coach profile
coachRouter.delete('/:id', validateToken, checkRole(['coach']), coachController.deleteCoachProfile);

module.exports = coachRouter;