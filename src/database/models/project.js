'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    'Project',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      githubLink: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      stack: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      technologies: {
        type: DataTypes.TEXT,
      },
      demoLink: {
        type: DataTypes.TEXT,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {}
  );
  Project.associate = function (models) {
    Project.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };
  return Project;
};
