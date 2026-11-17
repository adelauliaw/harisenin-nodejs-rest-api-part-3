<<<<<<< HEAD
const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth");
const { show } = require("../controllers/profile.controller");
router.get("/", verifyToken, show);
module.exports = router;
=======
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
>>>>>>> origin/dev
