// models/User.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VoterDetail extends Model {
    static associate(models) {
    }
  }

  VoterDetail.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    }
  }, {
    sequelize,
    modelName: 'VoterDetail',
    tableName: 'VoterDetails',
    timestamps: true,
  });

  return VoterDetail;
};
