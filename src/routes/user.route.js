const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/user.controller');
const { validateToken, checkRole } = require('../middlewares/AuthMiddleware');

userRouter.get('/', validateToken, checkRole(['admin']), userController.getAllUsers);
userRouter.get('/:id', validateToken, userController.getUserById);
userRouter.put('/:id', validateToken, checkRole(['admin']), userController.updateUser);
userRouter.delete('/:id', validateToken, checkRole(['admin']), userController.deleteUser);
userRouter.put('/edit-profile/:id', validateToken, userController.editProfile);

module.exports = userRouter;