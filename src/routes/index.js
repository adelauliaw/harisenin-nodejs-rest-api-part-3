const express =
  require("express");

const authRouter =
  require("./auth.router");

const userRouter =
  require("./user.router");

const profileRouter =
  require("./profile.router");

const postRouter = 
  require("./post.router")

const router =
  express.Router();

router.use(
  "/auth",
  authRouter
);

router.use(
  "/users",
  userRouter
);

router.use(
  "/profile",
  profileRouter
);

router.use(
  "/posts",
  postRouter
);

module.exports =
  router;