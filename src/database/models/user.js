'use strict';

import bcrypt from 'bcryptjs';

const { BCRYPT_SALT } = process.env;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    },
    {}
  );
  User.associate = function (models) {
    User.hasMany(models.Project, {
      foreignKey: 'userId',
      as: 'projects',
    });
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role',
    });
  };
  User.addHook('beforeValidate', async (user) => {
    if (!user.roleId) {
      const [userRole] = await user.sequelize.models.Role.findOrCreate({
        where: { name: 'user' },
      });
      user.roleId = userRole.id;
    }
  });
  User.addHook('beforeCreate', async (user) => {
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, Number(BCRYPT_SALT));
    }
  });
  User.addHook('beforeBulkCreate', async (users) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].dataValues.password) {
        users[i].dataValues.password = bcrypt.hashSync(
          users[i].dataValues.password,
          Number(BCRYPT_SALT)
        );
      }
      // // run test to see if this block works
      // if (!users[i].dataValues.roleId) {
      //   const userRole = await users[i].sequelize.models.Role.findOrCreate({
      //     where: { name: 'user' },
      //   });
      //   users[i].dataValues.roleId = userRole.id;
      // }
    }
  });
  return User;
};
