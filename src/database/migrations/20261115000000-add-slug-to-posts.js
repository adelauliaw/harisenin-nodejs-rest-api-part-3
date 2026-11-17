"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Allow rerunning after a partial MySQL DDL failure.
    const columns = await queryInterface.describeTable("posts");
    if (!columns.slug) {
      await queryInterface.addColumn("posts", "slug", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Preserve existing posts with a stable slug based on their unique ID.
    await queryInterface.sequelize.query(
      "UPDATE posts SET slug = CONCAT('post-', id) WHERE slug IS NULL"
    );

    await queryInterface.changeColumn("posts", "slug", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    const indexes = await queryInterface.showIndex("posts");
    if (!indexes.some((index) => index.name === "posts_slug_unique")) {
      await queryInterface.addIndex("posts", ["slug"], {
        name: "posts_slug_unique",
        unique: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("posts", "posts_slug_unique");
    await queryInterface.removeColumn("posts", "slug");
  },
};
