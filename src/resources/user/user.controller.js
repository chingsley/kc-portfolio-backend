import UserService from './user.services';
import AppController from '../app/app.controller';

export default class UserController extends AppController {
  static async registerUser(req, res, next) {
    try {
      const userService = new UserService(req, res);
      const user = await userService.createUser(req.body);
      return res.status(201).json({
        message: 'account successfully created',
        data: { ...user.dataValues, password: undefined },
      });
    } catch (error) {
      UserController.handleError(error, req, res, next);
    }
  }
  static async getAllUsers(req, res, next) {
    try {
      const userService = new UserService(req, res);
      const data = await userService.fetchAllUsers();
      return res.status(200).json({
        message: 'successful',
        data,
      });
    } catch (error) {
      UserController.handleError(error, req, res, next);
    }
  }
}
