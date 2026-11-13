require("dotenv").config();

module.exports = {
  development: {
    dialect: "mysql",

    host:
      process.env.DATABASE_HOST,

    port:
      Number(
        process.env.DATABASE_PORT || 3306
      ),

    username:
      process.env.DATABASE_USER,

    password:
      process.env.DATABASE_PASSWORD,

    database:
      process.env.DATABASE_NAME,

    logging: false,
  },
};