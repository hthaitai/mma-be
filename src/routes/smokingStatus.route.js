const express = require('express');
const statusRouter = express.Router();
const smokingStatusController = require('../controllers/smokingStatus.controller');
const { validateToken, checkRole } = require('../middlewares/AuthMiddleware');

statusRouter.post('/:id', validateToken,
    checkRole(['user']),
    smokingStatusController.createSmokingStatus);
statusRouter.put('/:id', validateToken, smokingStatusController.updateSmokingStatus);
statusRouter.get('/:id', validateToken,
    checkRole(['user']),
    smokingStatusController.getStatusBysUserId);
statusRouter.delete('/:id', validateToken, smokingStatusController.deleteSmokingStatus);

module.exports = statusRouter;