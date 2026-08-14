const express =
  require("express");

const {
  verifyToken,
} = require(
  "../middlewares/auth"
);

const {
  profile,
} = require(
  "../controllers/profile.controller"
);

const router =
  express.Router();

router.get(
  "/",
  verifyToken,
  profile
);

module.exports =
  router;