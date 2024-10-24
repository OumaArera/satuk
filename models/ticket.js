'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Ticket extends Model {
        static associate(models) {
          Ticket.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    Ticket.init({
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',  
          key: 'id',
        },
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure the transactionCode is unique
      },
      ticketNumber: {
        type: DataTypes.STRING,
        defaultValue: 'XXXX',
        allowNull: true,  
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',  
        allowNull: false,
      }
    }, {
      sequelize,
      modelName: 'Ticket',
      tableName: 'Tickets',
      timestamps: true, 
    });

    return Ticket;
};
