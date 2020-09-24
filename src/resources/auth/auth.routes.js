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

// /password/initiate_reset
router.post(
  '/request_password_reset',
  UserMiddleware.validateEmail,
  AuthController.requestPasswordReset
);

// /validate_password_reset_token
router.get(
  '/validate_password_reset_token',
  AuthMiddleware.validateUUID,
  AuthController.validatePasswordResetToken
);

export default router;
