// models/Candidate.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Candidate extends Model {
    static associate(models) {
      Candidate.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    }
  }

  Candidate.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      }
    },
    vote: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Candidate',
    tableName: 'Candidates',
    timestamps: true,
  });

  return Candidate;
};
