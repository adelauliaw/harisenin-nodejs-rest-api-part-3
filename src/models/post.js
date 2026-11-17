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

      slug: {
<<<<<<< HEAD
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
=======
  type:
    DataTypes.STRING,

  allowNull: true,

  unique: true,
},
>>>>>>> origin/dev

      content: {
        type:
          DataTypes.TEXT,

        allowNull: true,
      },
    },
<<<<<<< HEAD
=======
    
>>>>>>> origin/dev

    {
      sequelize,

      modelName: "post",

      tableName: "posts",

      underscored: true,
    }
  );

  return post;
<<<<<<< HEAD
};
=======
};
>>>>>>> origin/dev
