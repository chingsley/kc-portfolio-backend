import db from '../../database/models';

export default class UserService {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async createUser(newUser) {
    await this.rejectDuplicateEmail(newUser.email);
    await this.rejectDuplicateUsername(newUser.username);
    return await db.User.create(newUser);
  }

  async rejectDuplicateEmail(email) {
    const user = await this.findBy('email', email);
    if (user) {
      throw new Error(
        JSON.stringify({
          status: 409,
          err: `email ${email} already exists. Duplicate email is not allowed`,
        })
      );
    }
  }

  async rejectDuplicateUsername(username) {
    const user = await this.findBy('username', username);
    if (user) {
      throw new Error(
        JSON.stringify({
          status: 409,
          err: `username ${username} already exists. Duplicate username is not allowed`,
        })
      );
    }
  }

  findBy(field, value) {
    return db.User.findOne({
      where: { [field]: value },
      include: [{ model: db.Project, as: 'projects' }],
    });
  }
}
