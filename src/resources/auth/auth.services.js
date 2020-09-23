import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../../database/models';
import Jwt from '../../utils/Jwt';
import helper from '../../utils/helpers';
import Email from '../../utils/Email';
import UserService from '../user/user.services';

/**
 * AuthService inherits from UserSerice, while
 * UserService inturn inherits from AppService.
 * Hence, AuthService has access to all the
 * methods of both UserService and AppService
 */
export default class AuthService extends UserService {
  constructor(req, res) {
    super(req, res);
  }

  handleLogin = async () => {
    const { email, username, password } = this.req.body;
    let user = email
      ? await this.findBy('email', email)
      : await this.findBy('username', username);
    if (!user) {
      this.throwError({
        status: 401,
        err: 'Login failed. Invalid credentials.',
        errorCode: '001',
      });
    }
    const isCorrectPassword = bcrypt.compareSync(password, user.password);
    if (isCorrectPassword) {
      return {
        user: { ...user.dataValues, password: undefined },
        token: Jwt.generateToken(user),
      };
    } else {
      this.throwError({
        status: 401,
        err: 'Login failed. Invalid credentials.',
        errorCode: '002',
      });
    }
  };

  initiatePasswordReset = async () => {
    const { email } = this.req.body;

    let passwordReset = null;
    const user = await this.findBy('email', email);
    if (user) {
      passwordReset = await db.PasswordReset.upsert(
        {
          userId: user.id,
          resetToken: uuidv4(),
          expires: helper.setMinutes(30),
        },
        { returning: true }
      );
      const message = Email.getPasswordResetTemplate(
        passwordReset[0].resetToken
      );
      await Email.send({ email: user.email, message, html: message });
    }

    return user;
  };

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
