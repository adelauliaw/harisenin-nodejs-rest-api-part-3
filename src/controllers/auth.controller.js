const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const {
  user: UserModel,
} = require("../models");

const register = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await UserModel.create({
        name,
        email,
        password:
          passwordHash,
      });

    return res
      .status(201)
      .json({
        message:
          "User successfully registered",

        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await UserModel.findOne({
        where: {
          email,
        },
      });

    if (!user) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email / password",

          data: null,
        });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email / password",

          data: null,
        });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1h",
        }
      );

    return res
      .status(200)
      .json({
        message:
          "User successfully logged in",

        data: {
          token,
        },
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};