const {
  user: UserModel,
} = require("../models");

const index = async (
  req,
  res,
  next
) => {
  try {
    const users =
      await UserModel.findAll({
        attributes: [
          "id",
          "name",
          "email",
        ],
      });

    return res.status(200).json({
      message: "Success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  index,
};