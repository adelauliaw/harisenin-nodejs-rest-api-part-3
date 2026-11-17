<<<<<<< HEAD
const { user: User } = require("../models");
exports.show = async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ["id", "name", "email", "createdAt", "updatedAt"] });
  if (!user) return res.status(401).json({ message: "User no longer exists", data: null });
  res.json({ message: "Success", data: user });
};
=======
const profile = (
  req,
  res
) => {
  return res
    .status(200)
    .json({
      message: "Success",
      data: req.user,
    });
};

module.exports = {
  profile,
};
>>>>>>> origin/dev
