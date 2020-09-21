import express from 'express';

// import rolesRoutes from './rolesRoutes';
import usersRoutes from '../../resources/user/user.routes';
import rolesRoutes from '../../resources/role/role.routes';
import authRoutes from '../../resources/auth/auth.routes';

const router = express.Router();

router.use('/roles', rolesRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);

export default router;
