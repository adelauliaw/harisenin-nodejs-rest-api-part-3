const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth");
const { show } = require("../controllers/profile.controller");
router.get("/", verifyToken, show);
module.exports = router;
