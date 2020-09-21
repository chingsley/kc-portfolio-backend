import Joi from '@hapi/joi';
import AppMiddleware from '../app/app.middleware';

export default class AuthMiddleware extends AppMiddleware {
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
