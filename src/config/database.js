require("dotenv").config({
  quiet: true,
});

const common = {
  dialect: "mysql",

  logging: false,
};

module.exports = {
  development: {
    ...common,

    host:
      process.env.DATABASE_HOST,

    port:
      Number(
        process.env.DATABASE_PORT ||
        3306
      ),

    username:
      process.env.DATABASE_USER,

    password:
      process.env.DATABASE_PASSWORD,

    database:
      process.env.DATABASE_NAME,
  },

  test: {
    ...common,

    host:
      process.env.DATABASE_HOST,

    port:
      Number(
        process.env.DATABASE_PORT ||
        3306
      ),

    username:
      process.env.DATABASE_USER,

    password:
      process.env.DATABASE_PASSWORD,

    database:
      process.env.DATABASE_NAME_TEST,
  },

  production: {
    ...common,

    host:
      process.env.MYSQLHOST,

    port:
      Number(
        process.env.MYSQLPORT ||
        3306
      ),

    username:
      process.env.MYSQLUSER,

    password:
      process.env.MYSQLPASSWORD,

    database:
      process.env.MYSQLDATABASE,
  },
};