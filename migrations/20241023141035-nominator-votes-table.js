'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Votes', 'nominatorId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Nominators',  
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Votes', 'nominatorId');
  }
};
