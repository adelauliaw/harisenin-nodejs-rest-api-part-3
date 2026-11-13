"use strict";

const {
  Model,
} = require("sequelize");

module.exports = (
  sequelize,
  DataTypes
) => {
  class post extends Model {
    static associate(models) {
      post.belongsTo(
        models.user,
        {
          foreignKey: "user_id",
          as: "user",
        }
      );
    }
  }

  post.init(
    {
      user_id: {
        type:
          DataTypes.INTEGER,

        allowNull: false,
      },

      title: {
        type:
          DataTypes.STRING,

        allowNull: false,
      },

      content: {
        type:
          DataTypes.TEXT,

        allowNull: true,
      },
    },

    {
      sequelize,

      modelName: "post",

      tableName: "posts",

      underscored: true,
    }
  );

  return post;
};