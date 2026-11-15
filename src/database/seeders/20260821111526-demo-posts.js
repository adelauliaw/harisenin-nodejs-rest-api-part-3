"use strict";

module.exports = {
  async up(
    queryInterface
  ) {
    await queryInterface.bulkInsert(
      "posts",
      [
        {
          user_id: 1,

          title:
            "From Node.js to Next.js",

          slug:
            "from-nodejs-to-nextjs",

          content:
            "We built the API with Node.js and consumed it using Next.js.",


  created_at: new Date(),
  updated_at: new Date(),
        },

        {
          user_id: 1,

          title:
            "Understanding Dynamic Routes",

          slug:
            "understanding-dynamic-routes",

          content:
            "One [slug].js file can be used to render multiple post pages.",

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        },

        {
          user_id: 1,

          title:
            "My First Full Stack Post",

          slug:
            "my-first-full-stack-post",

          content:
            "Node.js is my backend and Next.js is my frontend.",


  created_at: new Date(),
  updated_at: new Date(),
        },
      ]
    );
  },

  async down(
    queryInterface
  ) {
    await queryInterface.bulkDelete(
      "posts",
      {
        slug: [
          "from-nodejs-to-nextjs",
          "understanding-dynamic-routes",
          "my-first-full-stack-post",
        ],
      }
    );
  },
};