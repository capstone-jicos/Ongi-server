'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uniqueId: {
        type: Sequelize.STRING
      },
      display: {
        type: Sequelize.STRING
      },
      profileImage: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.INTEGER
      },
      state: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};