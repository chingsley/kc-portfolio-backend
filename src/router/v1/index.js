import express from 'express';

import rolesRoutes from './rolesRoutes';
import usersRoutes from './userRoutes';

const router = express.Router();

router.use('/roles', rolesRoutes);
router.use('/users', usersRoutes);

export default router;
