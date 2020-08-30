import express from 'express';

import RoleController from './role.controller';
import RoleMiddleware from './role.middleware';

const router = express.Router();

router.post('/', RoleMiddleware.validateRole, RoleController.addNewRole);
router.patch('/:id', RoleMiddleware.validateRole, RoleController.updateRole);
router.delete('/:id', RoleMiddleware.validateRoleId, RoleController.deleteRole);

export default router;
