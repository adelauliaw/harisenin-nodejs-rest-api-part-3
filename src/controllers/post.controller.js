const {
  post: PostModel,
  user: UserModel,
} = require("../models");

const index = async (
  req,
  res,
  next
) => {
  try {
    const posts =
      await PostModel.findAll({
        attributes: [
          "id",
          "user_id",
          "title",
          "slug",
          "content",
        ],

        include: [
          {
            model:
              UserModel,

            as:
              "user",

            attributes: [
              "id",
              "name",
              "email",
            ],
          },
        ],

        order: [
          [
            "id",
            "DESC",
          ],
        ],
      });

    return res
      .status(200)
      .json({
        message:
          "Success",

        data:
          posts,
      });
  } catch (error) {
    next(error);
  }
};

const showBySlug = async (
  req,
  res,
  next
) => {
  try {
    const {
      slug,
    } =
      req.params;

    const post =
      await PostModel.findOne({
        where: {
          slug,
        },

        attributes: [
          "id",
          "user_id",
          "title",
          "slug",
          "content",
        ],

        include: [
          {
            model:
              UserModel,

            as:
              "user",

            attributes: [
              "id",
              "name",
              "email",
            ],
          },
        ],
      });

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",

          data:
            null,
        });
    }

    return res
      .status(200)
      .json({
        message:
          "Success",

        data:
          post,
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  index,
  showBySlug,
};