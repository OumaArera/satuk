'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Nominations extends Model {
    static associate(models) {
    }
  }
  Nominations.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nominator: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    count: {
      type: DataTypes.INTEGER, 
      defaultValue: 0, 
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Nominations',
  });
  return Nominations;
};
