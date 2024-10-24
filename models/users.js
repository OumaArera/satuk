'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
          User.hasMany(models.Ticket, { foreignKey: 'userId', as: 'tickets' });
        }
    }

    User.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('admin', 'standard'),
        defaultValue: 'standard',
      },
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
    });

    return User;
};
