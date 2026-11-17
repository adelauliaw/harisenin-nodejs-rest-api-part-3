<<<<<<< HEAD
const validator = require("validator");
const { user: User } = require("../models");
const bad = (res, message) => res.status(400).json({ message, data: null });
function validateCredentials(req, res, next) {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string" || !password) return bad(res, "Email and password must be non-empty strings");
  req.body.email = email.trim().toLowerCase();
  if (req.body.email.length > 255 || !validator.isEmail(req.body.email)) return bad(res, "Invalid email");
  if (Buffer.byteLength(password, "utf8") > 72) return bad(res, "Password must not exceed 72 UTF-8 bytes");
  next();
}
async function registerRules(req, res, next) {
  const { name, email, password } = req.body;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 255) return bad(res, "Name must contain 1 to 255 characters");
  if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) return bad(res, "Password requires 8 characters, uppercase, lowercase, number and symbol");
  if (await User.findOne({ where: { email } })) return res.status(409).json({ message: "Email already registered", data: null });
  req.body.name = name.trim();
  next();
}
function validatePost(req, res, next) {
  const { title, content } = req.body || {};
  if (typeof title !== "string" || !title.trim() || title.trim().length > 255) return bad(res, "Title must contain 1 to 255 characters");
  if (content != null && (typeof content !== "string" || Buffer.byteLength(content, "utf8") > 65535)) return bad(res, "Content must be text of at most 65535 UTF-8 bytes");
  req.body.title = title.trim();
  next();
}
module.exports = { validateLogin: validateCredentials, validateRegister: [validateCredentials, registerRules], validatePost };
=======
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
>>>>>>> origin/dev
