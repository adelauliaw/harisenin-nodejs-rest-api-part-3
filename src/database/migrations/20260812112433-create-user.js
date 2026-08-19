"use strict";

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    await queryInterface.createTable(
      "users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type:
            Sequelize.INTEGER,
        },

        name: {
          allowNull: false,
          type:
            Sequelize.STRING,
        },

        email: {
          allowNull: false,
          unique: true,
          type:
            Sequelize.STRING,
        },

        password: {
          allowNull: false,
          type:
            Sequelize.STRING,
        },

        created_at: {
          allowNull: false,
          type:
            Sequelize.DATE,
        },

        updated_at: {
          allowNull: false,
          type:
            Sequelize.DATE,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "users"
    );
  },
};