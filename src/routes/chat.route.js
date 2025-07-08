const express = require('express');
const chatRouter = express.Router();
const chatController = require('../controllers/chat.controller');
const { validateToken } = require('../middlewares/AuthMiddleware');

// All routes in this file are protected and require authentication

// Route to start a new chat
chatRouter.post('/', validateToken, chatController.startChat);

// Route to send a message in a chat
chatRouter.post('/:chatId/message', validateToken, chatController.sendMessage);

// Route to get the history of a chat
chatRouter.get('/:chatId', validateToken, chatController.getChatHistory);

// Route to get all chat sessions for a user
chatRouter.get('/sessions/:userId', validateToken, chatController.getChatSessions);

module.exports = chatRouter;
