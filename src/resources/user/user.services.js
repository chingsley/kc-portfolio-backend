import db from '../../database/models';
import Cloudinary from '../../utils/Cloudinary';
import Email from '../../utils/Email';
import AppService from '../app/app.service';

export default class UserService extends AppService {
  constructor(req, res) {
    super(req, res);
  }

  createUser = async (t) => {
    const newUser = this.req.body;
    await this.rejectDuplicateEmail(newUser.email);
    await this.rejectDuplicateUsername(newUser.username);
    newUser.roleId = await this.getRoleId('user');
    newUser.image = this.req.files
      ? await Cloudinary.uploadImage(this.req.files)
      : newUser.image;
    return db.User.create(newUser, { transaction: t });
  };

  fetchAllUsers = () => {
    return db.User.findAndCountAll({
      attributes: { exclude: ['password'] },
      where: {
        ...this.filterBy(['firstName', 'lastName', 'username', 'email']),
      },
      ...this.paginate(),
      include: [
        { model: db.Role, as: 'role', attributes: ['name'] },
        { model: db.Project, as: 'projects' },
      ],
    });
  };

  sendUserMessage = async () => {
    const { userId } = this.req.params;
    const user = await this.findBy('id', userId);
    if (user) {
      const message = Email.getMsgTemplate(this.req.body);
      await Email.send({ email: user.email, message, html: message });
    } else {
      this.throwError({
        status: 409,
        err: `no user matches the id of ${userId}`,
      });
    }
    return user;
  };

  rejectDuplicateEmail = async (email) => {
    const user = await this.findBy('email', email);
    if (user && `${this.req.params.id}` !== `${user.id}`) {
      this.throwError({
        status: 409,
        err: `email ${email} already exists. Duplicate email is not allowed`,
      });
    }
  };

  rejectDuplicateUsername = async (username) => {
    const user = await this.findBy('username', username);
    if (user && `${this.req.params.id}` !== `${user.id}`) {
      this.throwError({
        status: 409,
        err: `username ${username} already exists. Duplicate username is not allowed`,
      });
    }
  };

  findBy = (field, value) => {
    return db.User.findOne({
      where: { [field]: value },
      include: [{ model: db.Role, as: 'role' }],
    });
  };

  getRoleId = async (roleName) => {
    const [role] = await db.Role.findOrCreate({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`role name ${roleName} does not exist`);
    }

    return role.id;
  };
}
