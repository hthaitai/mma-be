const express = require('express');
const postController = require('../controllers/post.controller');
const postRouter = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');

postRouter.post('/create', validateToken, postController.createPost);
postRouter.get('/',  postController.getAllPosts);
postRouter.post('/like/:id', validateToken, postController.likePost);
postRouter.get('/user/:id', validateToken, postController.getPostsByUserId);
postRouter.get('/tag/:id',  postController.getPostByTagId);
postRouter.put('/:id', validateToken, postController.editPost);
postRouter.delete('/:id', validateToken, postController.deletePost);
postRouter.get('/:id',  postController.getPostById);

module.exports = postRouter;