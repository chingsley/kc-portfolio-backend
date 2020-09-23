import db from '../../src/database/models';
import UserTestHelper from '../user/user.testHelper';

class AuthTestHelper extends UserTestHelper {
  async getUserPasswordResetToken(userEmail) {
    const user = await db.User.findOne({
      where: { email: userEmail },
      include: { model: db.PasswordReset, as: 'passwordReset' },
    });
    return user.passwordReset.resetToken;
  }

  async updatePasswordResetToken(resetToken, update) {
    const token = await db.PasswordReset.findOne({ where: { resetToken } });
    if (!token) {
      throw new Error(`${resetToken} not found in the db`);
    }
    await token.update({ ...update });
    return token;
  }
}

export default AuthTestHelper;
