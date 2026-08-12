"use strict";

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    await queryInterface.createTable(
      "posts",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type:
            Sequelize.INTEGER,
        },

        user_id: {
          allowNull: false,

          type:
            Sequelize.INTEGER,

          references: {
            model: "users",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        title: {
          allowNull: false,
          type:
            Sequelize.STRING,
        },

        content: {
          allowNull: true,
          type:
            Sequelize.TEXT,
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
      "posts"
    );
  },
};