import express from 'express';

import RoleController from './role.controller';

const router = express.Router();

router.delete('/:id', RoleController.deleteRole);
router.patch('/:id', RoleController.updateRole);

export default router;
