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