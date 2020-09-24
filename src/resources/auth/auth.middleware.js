import Joi from '@hapi/joi';
import AppMiddleware from '../app/app.middleware';
import { validateSchema } from '../helpers';
import { PASSWORD_REGEX } from '../user/user.middleware';

export default class AuthMiddleware extends AppMiddleware {
  static async validateLoginDetails(req, res, next) {
    try {
      const loginSchema = Joi.object()
        .keys({
          username: Joi.string().trim(),
          email: Joi.string().trim(),
          password: Joi.string().trim().required(),
        })
        .or('email', 'username');

      const error = await validateSchema(loginSchema, req);
      if (error) return res.status(400).json({ error });
      return next();
    } catch (error) {
      return next(error.message);
    }
  }

  static async validatePasswordResetDetails(req, res, next) {
    try {
      const schema = Joi.object({
        resetToken: Joi.string().guid({
          version: ['uuidv4', 'uuidv5'],
        }),
        password: Joi.string().regex(PASSWORD_REGEX).required(),
      });
      const error = await validateSchema(schema, req);
      if (error) return res.status(400).json({ error });
      return next();
    } catch (error) {
      return next(error.message);
    }
  }
}
