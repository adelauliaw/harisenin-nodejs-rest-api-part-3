<<<<<<< HEAD
const router = require("express").Router();
const { index, showBySlug, create } = require("../controllers/post.controller");
const { verifyToken } = require("../middlewares/auth");
const { validatePost } = require("../middlewares/validator");
router.get("/", index);
router.get("/:slug", showBySlug);
router.post("/", verifyToken, validatePost, create);
module.exports = router;
=======
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
>>>>>>> origin/dev
