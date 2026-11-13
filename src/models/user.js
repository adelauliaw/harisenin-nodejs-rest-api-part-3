"use strict";

const {
  Model,
} = require("sequelize");

module.exports = (
  sequelize,
  DataTypes
) => {
  class user extends Model {
    static associate(models) {
      user.hasMany(
        models.post,
        {
          foreignKey: "user_id",
          as: "posts",
        }
      );
    }
  }

  user.init(
    {
      name: {
        type:
          DataTypes.STRING,

        allowNull: false,
      },

      email: {
        type:
          DataTypes.STRING,

        allowNull: false,

        unique: true,
      },

      password: {
        type:
          DataTypes.STRING,

        allowNull: false,
      },
    },

    {
      sequelize,

      modelName: "user",

      tableName: "users",

      underscored: true,
    }
  );

  return user;
};