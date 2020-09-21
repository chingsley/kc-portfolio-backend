import AppController from '../app/app.controller';
import AuthService from './auth.services';

export default class AuthController extends AppController {
  static async validatePasswordResetKey(req, res, next) {
    try {
      const authService = new AuthService(req, res);
      const user = await authService.getUserByPasswordResetKey();
      return res.status(200).json({
        message: 'successfully validated user password reset key',
        isValidPasswordResetToken: true,
        user,
      });
    } catch (error) {
      AuthController.handleError(error, req, res, next);
    }
  }
}
