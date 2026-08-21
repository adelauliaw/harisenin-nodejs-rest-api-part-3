const express =
  require("express");

const {
  index,
  showBySlug,
} = require(
  "../controllers/post.controller"
);

const router =
  express.Router();

router.get(
  "/",
  index
);

router.get(
  "/:slug",
  showBySlug
);

module.exports =
  router;