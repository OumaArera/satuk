'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Nominations', 'nominator', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('Nominations', 'count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Nominations', 'nominator');
    await queryInterface.removeColumn('Nominations', 'count');
  }
};
