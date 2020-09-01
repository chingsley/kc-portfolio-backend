import db from '../../database/models';
import Cloudinary from '../../utils/Cloudinary';

export default class UserService {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async createUser(newUser) {
    await this.rejectDuplicateEmail(newUser.email);
    await this.rejectDuplicateUsername(newUser.username);
    newUser.roleId = await this.getRoleId('user');
    newUser.image = this.req.files
      ? await Cloudinary.uploadImage(this.req.files)
      : newUser.image;
    return db.User.create(newUser);
  }

  async rejectDuplicateEmail(email) {
    const user = await this.findBy('email', email);
    if (user && `${this.req.params.id}` !== `${user.id}`) {
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
    if (user && `${this.req.params.id}` !== `${user.id}`) {
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

  async getRoleId(roleName) {
    const [role] = await db.Role.findOrCreate({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`role name ${roleName} does not exist`);
    }

    return role.id;
  }
}
