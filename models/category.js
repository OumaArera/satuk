// models/Category.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Candidate, { foreignKey: 'categoryId', as: 'candidates' });
    }
  }

  Category.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: true,
  });

  return Category;
};
