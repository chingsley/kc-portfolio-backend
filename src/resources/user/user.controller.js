import UserService from './user.services';

export default class UserController {
  static async registerUser(req, res, next) {
    try {
      const userService = new UserService(req, res);
      const user = await userService.createUser(req.body);
      return res
        .status(201)
        .json({ message: 'account successfully created', data: user });
    } catch (error) {
      UserController.handleError(error, req, res, next);
    }
  }

  static handleError(error, req, res, next) {
    try {
      const { status, err } = JSON.parse(error.message);
      return res.status(status).json({ error: err });
    } catch (e) {
      return next(error.message);
    }
  }
}
