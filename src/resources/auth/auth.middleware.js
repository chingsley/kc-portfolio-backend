import Joi from '@hapi/joi';
import AppMiddleware from '../app/app.middleware';
import { validateSchema } from '../helpers';

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
}
