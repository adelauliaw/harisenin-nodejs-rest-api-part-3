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