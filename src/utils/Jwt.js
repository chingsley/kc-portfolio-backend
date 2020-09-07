import jwt from 'jsonwebtoken';
const { JWT_SECRET } = process.env;
import moment from 'moment';

class Jwt {
  static generateToken(user) {
    const payload = {
      subject: user.uuid,
      username: user.username,
      timestamp: moment().format('YYYYMMDDHHmmss'),
    };
    const options = { expiresIn: '1d' };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error(
        JSON.stringify({ error: 'Access denied. Invalid token.', status: 401 })
      );
    }
  }
}

export default Jwt;
