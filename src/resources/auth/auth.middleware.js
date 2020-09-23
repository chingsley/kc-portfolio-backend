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

  static async validateUUID(req, res, next) {
    try {
      const schema = Joi.object({
        token: Joi.string().guid({
          version: ['uuidv4', 'uuidv5'],
        }),
      });
      const { token } = req.headers;
      const { error } = schema.validate({ token });
      if (error)
        return res.status(400).json({
          error: 'invalid token',
          errorCode: 'PRT001',
        });
      return next();
    } catch (error) {
      return next(error.message);
    }
  }
}
