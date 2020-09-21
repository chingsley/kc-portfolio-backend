import express from 'express';

import UserController from './user.controller';
import UserMiddleware from './user.middleware';

const router = express.Router();

router.post(
  '/',
  UserMiddleware.validateNewUser,
  UserMiddleware.validateImageUpload,
  UserController.registerUser
);

router.post(
  '/login',
  UserMiddleware.validateLoginDetails,
  UserController.loginUser
);

router.post(
  '/request_password_reset',
  UserMiddleware.validateEmail,
  UserController.requestPasswordReset
);

router.get('/', UserController.getAllUsers);

export default router;
