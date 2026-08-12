const validator =
  require("validator");

const {
  user: UserModel,
} = require("../models");

const validateRegister =
  async (
    req,
    res,
    next
  ) => {
    try {
      let {
        name,
        email,
        password,
      } = req.body;

      name =
        name?.trim();

      email =
        email
          ?.trim()
          .toLowerCase();

      if (
        !name ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            message:
              "Bad request",

            data: null,
          });
      }

      if (
        !validator.isEmail(
          email
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid email",

            data: null,
          });
      }

      if (
        !validator.isStrongPassword(
          password,
          {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Weak password",

            data: null,
          });
      }

      const existingUser =
        await UserModel.findOne({
          where: {
            email,
          },
        });

      if (existingUser) {
        return res
          .status(400)
          .json({
            message:
              "Email already registered",

            data: null,
          });
      }

      req.body.name =
        name;

      req.body.email =
        email;

      next();
    } catch (error) {
      next(error);
    }
  };

const validateLogin = (
  req,
  res,
  next
) => {
  let {
    email,
    password,
  } = req.body;

  email =
    email
      ?.trim()
      .toLowerCase();

  if (
    !email ||
    !password
  ) {
    return res
      .status(400)
      .json({
        message:
          "Bad request",

        data: null,
      });
  }

  if (
    !validator.isEmail(
      email
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid email",

        data: null,
      });
  }

  req.body.email =
    email;

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};