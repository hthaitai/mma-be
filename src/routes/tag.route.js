const express = require('express');
const tagController = require('../controllers/tag.controller');
const tagRouter = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');

tagRouter.post('/create', validateToken, tagController.createTag);
tagRouter.get('/', validateToken, tagController.getAllTags);

module.exports = tagRouter;