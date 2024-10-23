'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Votes extends Model {
    static associate(models) {
      Votes.belongsTo(models.Nominees, { foreignKey: 'nomineeId' });
    }
  }

  Votes.init({
    nomineeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Nominees', // Ensure this matches the model name
        key: 'id',
      },
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Votes', 
  });

  return Votes;
};
