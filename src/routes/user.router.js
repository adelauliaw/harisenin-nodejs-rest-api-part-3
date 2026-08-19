const express =
  require("express");

const {
  index,
} = require(
  "../controllers/user.controller"
);

const {
  verifyToken,
} = require(
  "../middlewares/auth"
);

const router =
  express.Router();

router.get(
  "/",
  verifyToken,
  index
);

module.exports =
  router;