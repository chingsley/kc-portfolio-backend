import RoleService from './role.services';
import AppController from '../app/app.controller';

export default class RoleController extends AppController {
  static async deleteRole(req, res, next) {
    try {
      const roleService = new RoleService(req, res);
      const { id } = req.params;
      await roleService.remove(Number(id));
      return res.status(200).json({ message: 'role successfully deleted' });
    } catch (error) {
      RoleController.handleError(error, req, res, next);
    }
  }
  static async updateRole(req, res, next) {
    try {
      const roleService = new RoleService(req, res);
      // const { id } = req.params;
      const { id, name, updatedAt } = await roleService.update(
        Number(req.params.id),
        req.body
      );
      return res
        .status(200)
        .json({
          message: 'role successfully updated',
          data: { id, name, updatedAt },
        });
    } catch (error) {
      RoleController.handleError(error, req, res, next);
    }
  }
}
