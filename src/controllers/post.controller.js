const { randomUUID } = require("node:crypto");
const { post: Post, user: User } = require("../models");
const author = { model: User, as: "user", attributes: ["id", "name"] };
exports.index = async (req, res) => {
  const posts = await Post.findAll({ include: [author], order: [["id", "DESC"]] });
  res.json({ message: "Success", data: posts });
};
exports.showBySlug = async (req, res) => {
  const post = await Post.findOne({ where: { slug: req.params.slug }, include: [author] });
  if (!post) return res.status(404).json({ message: "Post not found", data: null });
  res.json({ message: "Success", data: post });
};
exports.create = async (req, res) => {
  const { title, content } = req.body;
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180) || "post";
  const post = await Post.create({ title, content: content ?? null, slug: `${base}-${randomUUID()}`, user_id: req.user.id });
  const result = await Post.findByPk(post.id, { include: [author] });
  res.status(201).json({ message: "Post successfully created", data: result });
};
