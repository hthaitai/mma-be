const express = require('express');
const statusRouter = express.Router();
const smokingStatusController = require('../controllers/smokingStatus.controller');
const { validateToken } = require('../middlewares/AuthMiddleware');

statusRouter.post('/:id', validateToken, smokingStatusController.createSmokingStatus);
statusRouter.put('/:id', validateToken, smokingStatusController.updateSmokingStatus);
statusRouter.get('/:id', validateToken, smokingStatusController.getStatusBysUserId);
statusRouter.put('/:id', validateToken, smokingStatusController.deleteSmokingStatus);

module.exports = statusRouter;