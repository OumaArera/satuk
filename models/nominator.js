'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Nominator extends Model {
    static associate(models) {
      Nominator.hasMany(models.Nominees, { foreignKey: 'nominatorId' });
    }
  }

  Nominator.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  }, {
    sequelize,
    modelName: 'Nominator',
  });

  return Nominator;
};
