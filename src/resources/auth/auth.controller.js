import AppController from '../app/app.controller';
import AuthService from './auth.services';

export default class AuthController extends AppController {
  static async validatePasswordResetToken(req, res, next) {
    try {
      const authService = new AuthService(req, res);
      const user = await authService.getUserByPasswordResetToken();
      return res.status(200).json({
        message: 'successfully validated reset token',
        isValidPasswordResetToken: true,
        user,
      });
    } catch (error) {
      AuthController.handleError(error, req, res, next);
    }
  }
}
