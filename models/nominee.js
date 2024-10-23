'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Nominees extends Model {
    static associate(models) {
      Nominees.belongsTo(models.Nominator, { foreignKey: 'nominatorId' });
      Nominees.hasMany(models.Votes, { foreignKey: 'nomineeId', as: 'votes' });
    }
  }

  Nominees.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nominatorId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Nominators',
        key: 'id',
      },
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Nominees', 
  });

  return Nominees;
};
