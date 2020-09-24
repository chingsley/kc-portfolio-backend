import express from 'express';
import UserMiddleware from '../user/user.middleware';
import AuthController from './auth.controller';
import AuthMiddleware from './auth.middleware';

const router = express.Router();

router.post(
  '/login',
  AuthMiddleware.validateLoginDetails,
  AuthController.loginUser
);

router.post(
  '/request_password_reset',
  UserMiddleware.validateEmail,
  AuthController.requestPasswordReset
);

router.get(
  '/validate_password_reset_token',
  AuthController.validatePasswordResetToken
);

router.patch(
  '/password/:resetToken',
  AuthMiddleware.validatePasswordResetDetails,
  AuthController.changePassword
);

export default router;
