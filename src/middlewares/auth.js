<<<<<<< HEAD
const jwt = require("jsonwebtoken");
const { user: User } = require("../models");
exports.verifyToken = async (req, res, next) => {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  const unauthorized = () => res.status(401).json({ message: "Invalid or expired token", data: null });
  if (!match) return unauthorized();
  let payload;
  try { payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"] }); }
  catch { return unauthorized(); }
  if (!Number.isInteger(payload.id) || payload.id < 1) return unauthorized();
  const user = await User.findByPk(payload.id, { attributes: ["id", "name", "email"] });
  if (!user) return unauthorized();
  req.user = user.get({ plain: true });
  next();
};
=======
const jwt =
  require("jsonwebtoken");

const verifyToken = (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization ||
      "";

    const [
      scheme,
      token,
    ] =
      authHeader.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid token",

          data: null,
        });
    }

    const user =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user =
      user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        message:
          "Invalid token",

        data: null,
      });
  }
};

module.exports = {
  verifyToken,
};
>>>>>>> origin/dev
