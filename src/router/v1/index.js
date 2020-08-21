import express from 'express';

import rolesRoutes from './rolesRoutes';
import usersRoutes from '../../resources/user/user.route';

const router = express.Router();

router.use('/roles', rolesRoutes);
router.use('/users', usersRoutes);

export default router;
