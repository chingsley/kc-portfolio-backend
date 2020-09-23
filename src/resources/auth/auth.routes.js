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
  '/password/validate_reset_token',
  AuthMiddleware.validateUUID,
  AuthController.validatePasswordResetToken
);

export default router;
