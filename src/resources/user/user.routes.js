import express from 'express';
import { admin, superadmin } from '../../utils/allowedRoles';
import AuthMiddleware from '../auth/auth.middleware';

import UserController from './user.controller';
import UserMiddleware from './user.middleware';

const router = express.Router();

router.post(
  '/',
  UserMiddleware.validateNewUser,
  UserMiddleware.validateImageUpload,
  UserController.registerUser
);

router.get(
  '/',
  AuthMiddleware.authorize([superadmin, admin]),
  UserController.getAllUsers
);

// router.post(
//   '/:username/:projectName',
//   AuthMiddleware.authorize([admin, superadmin, accountOwner]),
//   (req, res, next) => {
//     console.log(req.params);
//     res.send('testing.....');
//   }
// );

export default router;
