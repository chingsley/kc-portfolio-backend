import db from '../../database/models';
import AppService from '../app/app.service';

export default class AuthService extends AppService {
  constructor(req, res) {
    super(req, res);
  }

  getUserByPasswordResetToken = async () => {
    const { token: resetToken } = this.req.headers;
    const token = await db.PasswordReset.findOne({
      where: { resetToken },
      include: {
        model: db.User,
        as: 'user',
        attributes: { exclude: 'password' },
      },
    });

    // console.log(token);

    if (!token) {
      this.throwError({
        status: 400,
        err: 'invalid token',
        errorCode: 'PRT002',
      });
    }

    if (token && token.expires < Date.now()) {
      this.throwError({
        status: 400,
        err: 'invalid token',
        errorCode: 'PRT003',
      });
    }

    return token.user;
  };
}
