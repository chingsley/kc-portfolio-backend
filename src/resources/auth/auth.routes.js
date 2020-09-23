import express from 'express';
import AuthController from './auth.controller';
import AuthMiddleware from './auth.middleware';

const router = express.Router();

router.get(
  '/password/validate_reset_token',
  AuthMiddleware.validateUUID,
  AuthController.validatePasswordResetToken
);

export default router;
