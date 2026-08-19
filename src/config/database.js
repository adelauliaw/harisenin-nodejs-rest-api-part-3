require("dotenv").config();

const baseConfig = {
  dialect: "mysql",

  host:
    process.env.DATABASE_HOST,

  port: Number(
    process.env.DATABASE_PORT || 3306
  ),

  username:
    process.env.DATABASE_USER,

  password:
    process.env.DATABASE_PASSWORD,

  logging: false,
};

module.exports = {

  development: {
    ...baseConfig,

    database:
      process.env.DATABASE_NAME,
  },

  test: {
    ...baseConfig,

    database:
      process.env.DATABASE_NAME_TEST ||
      process.env.DATABASE_NAME,
  },

};