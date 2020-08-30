import express from 'express';

// import rolesRoutes from './rolesRoutes';
import usersRoutes from '../../resources/user/user.routes';
import rolesRoutes from '../../resources/role/role.routes';

const router = express.Router();

router.use('/roles', rolesRoutes);
router.use('/users', usersRoutes);

export default router;
