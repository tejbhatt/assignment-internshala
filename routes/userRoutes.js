
const express = require('express');
var userRouter = express.Router();
var userController = require('../controllers/userController');

userRouter.route('/signup')
.post(userController.signUp);

userRouter.route('/signin')
.post(userController.signIn);

userRouter.route('/user/me')
.get(userController.getUser);

module.exports = userRouter;