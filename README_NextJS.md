# Next.js Part 1 — Continue from Node.js REST API Part 3

Harisenin Bootcamp — Full-Stack Web Developer

> **Goal:** jangan bikin backend baru. Kita lanjutkan project `harisenin-nodejs-rest-api-part-3` yang sudah selesai sampai **Phase 4 — Jest + Supertest**, lalu Next.js menjadi frontend yang memakai data dari backend tersebut.

---

# What We Already Have

Dari project Node.js sebelumnya, kita sudah punya:

```text
Express.js
↓
Routes
↓
Validator
↓
JWT Middleware
↓
Controllers
↓
Sequelize
↓
MySQL
```

Endpoint yang sudah ada:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/users
GET  /api/profile
```

Model yang sudah ada:

```text
User
Post
```

Testing yang sudah ada:

```text
Jest
Supertest
```

Sekarang kita lanjutkan flow menjadi:

```text
MySQL
↓
Sequelize
↓
Node.js REST API
↓
JSON
↓
Next.js
↓
React Component
↓
Browser
```

---

# Final Full-Stack Architecture

```text
BROWSER
   ↓
NEXT.JS
localhost:3000
   ↓
getStaticProps / getStaticPaths
   ↓
fetch()
   ↓
NODE.JS / EXPRESS
localhost:3001
   ↓
ROUTE
   ↓
CONTROLLER
   ↓
SEQUELIZE
   ↓
MYSQL
   ↓
JSON RESPONSE
```

---

# PART A — CONTINUE NODE.JS PROJECT

## 1. Open Existing Node.js Project

```bash
cd harisenin-nodejs-rest-api-part-3
```

Pastikan semua dependency sudah ada:

```bash
npm install
```

Check branch:

```bash
git branch
```

Dari README sebelumnya kita sudah punya:

```text
main
phase-1-sequelize
phase-2-auth
phase-3-validator
phase-4-testing
```

Pindah ke Phase 4:

```bash
git switch phase-4-testing
```

Buat branch baru:

```bash
git switch -c phase-5-nextjs-integration
```

---

# 2. Change Backend Port

Sebelumnya Node.js menggunakan:

```env
SERVER_PORT=3000
```

Next.js juga menggunakan port `3000`.

Supaya tidak tabrakan, update `.env` backend:

```env
SERVER_PORT=3001
```

Full example:

```env
SERVER_PORT=3001

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=

DATABASE_NAME=fsd_bootcamp
DATABASE_NAME_TEST=fsd_bootcamp_test

JWT_SECRET=harisenin_super_secret
```

Update `.env.example`:

```env
SERVER_PORT=3001

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password

DATABASE_NAME=fsd_bootcamp
DATABASE_NAME_TEST=fsd_bootcamp_test

JWT_SECRET=your_jwt_secret
```

Run:

```bash
npm run dev
```

Expected:

```text
Database connected
Server running on http://localhost:3001
```

Test:

```text
GET http://localhost:3001
```

---

# PART B — PREPARE POST DATA FOR NEXT.JS

Project Node.js sebelumnya sudah punya model:

```text
src/models/post.js
```

dengan:

```text
user_id
title
content
```

Next.js akan menggunakan dynamic URL:

```text
/posts/[slug]
```

Jadi kita tambahkan:

```text
slug
```

---

# 3. Create New Migration for `slug`

Jangan edit migration lama yang sudah pernah dijalankan.

Run:

```bash
npx sequelize-cli migration:generate --name add-slug-to-posts
```

Buka migration baru di:

```text
src/database/migrations/
```

Isi:

```js
"use strict";

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    await queryInterface.addColumn(
      "posts",
      "slug",
      {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      }
    );
  },

  async down(
    queryInterface
  ) {
    await queryInterface.removeColumn(
      "posts",
      "slug"
    );
  },
};
```

Run migration development:

```bash
npx sequelize-cli db:migrate
```

Run migration test:

```bash
npx sequelize-cli db:migrate --env test
```

Check DBeaver:

```sql
USE fsd_bootcamp;

DESCRIBE posts;
```

Expected ada:

```text
slug
```

---

# 4. Update Post Model

Open:

```text
src/models/post.js
```

Tambahkan `slug`:

```js
"use strict";

const {
  Model,
} = require("sequelize");

module.exports = (
  sequelize,
  DataTypes
) => {
  class post extends Model {
    static associate(models) {
      post.belongsTo(
        models.user,
        {
          foreignKey: "user_id",
          as: "user",
        }
      );
    }
  }

  post.init(
    {
      user_id: {
        type:
          DataTypes.INTEGER,

        allowNull: false,
      },

      title: {
        type:
          DataTypes.STRING,

        allowNull: false,
      },

      slug: {
        type:
          DataTypes.STRING,

        allowNull: true,

        unique: true,
      },

      content: {
        type:
          DataTypes.TEXT,

        allowNull: true,
      },
    },

    {
      sequelize,

      modelName: "post",

      tableName: "posts",

      underscored: true,
    }
  );

  return post;
};
```

---

# PART C — CREATE PUBLIC POSTS API

Untuk Next.js Part 1:

```text
READ posts
→ PUBLIC
```

Kita belum membuat create/update/delete dari Next.js.

Authentication dari Part 3 tetap dipakai untuk endpoint protected yang sudah ada.

---

# 5. Create Post Controller

Create:

```text
src/controllers/post.controller.js
```

Isi:

```js
const {
  post: PostModel,
  user: UserModel,
} = require("../models");

const index = async (
  req,
  res,
  next
) => {
  try {
    const posts =
      await PostModel.findAll({
        attributes: [
          "id",
          "user_id",
          "title",
          "slug",
          "content",
        ],

        include: [
          {
            model: UserModel,
            as: "user",
            attributes: [
              "id",
              "name",
              "email",
            ],
          },
        ],

        order: [
          [
            "id",
            "DESC",
          ],
        ],
      });

    return res
      .status(200)
      .json({
        message: "Success",
        data: posts,
      });
  } catch (error) {
    next(error);
  }
};

const showBySlug = async (
  req,
  res,
  next
) => {
  try {
    const {
      slug,
    } = req.params;

    const post =
      await PostModel.findOne({
        where: {
          slug,
        },

        attributes: [
          "id",
          "user_id",
          "title",
          "slug",
          "content",
        ],

        include: [
          {
            model: UserModel,
            as: "user",
            attributes: [
              "id",
              "name",
              "email",
            ],
          },
        ],
      });

    if (!post) {
      return res
        .status(404)
        .json({
          message:
            "Post not found",

          data: null,
        });
    }

    return res
      .status(200)
      .json({
        message: "Success",
        data: post,
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  index,
  showBySlug,
};
```

---

# 6. Create Post Router

Create:

```text
src/routes/post.router.js
```

Isi:

```js
const express =
  require("express");

const {
  index,
  showBySlug,
} = require(
  "../controllers/post.controller"
);

const router =
  express.Router();

router.get(
  "/",
  index
);

router.get(
  "/:slug",
  showBySlug
);

module.exports =
  router;
```

---

# 7. Add Post Router to Main Router

Open:

```text
src/routes/index.js
```

Tambahkan:

```js
const postRouter =
  require("./post.router");
```

Tambahkan:

```js
router.use(
  "/posts",
  postRouter
);
```

Contoh:

```js
const express =
  require("express");

const authRouter =
  require("./auth.router");

const userRouter =
  require("./user.router");

const profileRouter =
  require("./profile.router");

const postRouter =
  require("./post.router");

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
```

---

# PART D — ADD SAMPLE POSTS

## 8. Check User ID

DBeaver:

```sql
USE fsd_bootcamp;

SELECT
  id,
  name,
  email
FROM users;
```

Pilih `id` user yang sudah ada.

---

# 9. Insert Sample Posts

Contoh menggunakan:

```text
user_id = 1
```

Run:

```sql
INSERT INTO posts
(
  user_id,
  title,
  slug,
  content,
  created_at,
  updated_at
)
VALUES
(
  1,
  'Belajar Next.js Routing',
  'belajar-nextjs-routing',
  'Next.js Pages Router menggunakan file di folder pages sebagai route.',
  NOW(),
  NOW()
),
(
  1,
  'Dynamic Route dengan Slug',
  'dynamic-route-dengan-slug',
  'Satu file [slug].js dapat digunakan untuk menampilkan banyak detail page.',
  NOW(),
  NOW()
);
```

Check:

```sql
SELECT
  id,
  user_id,
  title,
  slug
FROM posts;
```

---

# PART E — TEST BACKEND

## 10. Run Node.js

```bash
npm run dev
```

Expected:

```text
Database connected
Server running on http://localhost:3001
```

---

# 11. Test Posts List

Postman:

```text
GET
http://localhost:3001/api/posts
```

Expected:

```json
{
  "message": "Success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Belajar Next.js Routing",
      "slug": "belajar-nextjs-routing",
      "content": "Next.js Pages Router menggunakan file di folder pages sebagai route."
    }
  ]
}
```

---

# 12. Test Post Detail

```text
GET
http://localhost:3001/api/posts/belajar-nextjs-routing
```

Expected:

```json
{
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Belajar Next.js Routing",
    "slug": "belajar-nextjs-routing"
  }
}
```

Test unknown:

```text
GET
http://localhost:3001/api/posts/post-tidak-ada
```

Expected:

```text
404
```

---

# BACKEND CHECKPOINT

```text
[ ] phase-5-nextjs-integration created

[ ] Node.js runs on 3001

[ ] MySQL runs

[ ] posts table has slug

[ ] sample posts exist

[ ] GET /api/posts works

[ ] GET /api/posts/:slug works

[ ] unknown slug returns 404
```

---

# PART F — CREATE NEXT.JS FRONTEND

## 13. Open New Terminal

Jangan matikan Node.js.

Sekarang kita pakai dua terminal:

```text
TERMINAL 1

Node.js
http://localhost:3001
```

```text
TERMINAL 2

Next.js
http://localhost:3000
```

---

# 14. Create Next.js Project

Run:

```bash
npx create-next-app@latest
```

Project name:

```text
harisenin-nextjs-part-1
```

Pilih:

```text
No, customize settings
```

Gunakan:

```text
TypeScript?
No

Linter?
ESLint

React Compiler?
No

Tailwind CSS?
No

Code inside src/ directory?
No

App Router?
No

Customize import alias?
No
```

> **IMPORTANT:** pilih `App Router = No` karena kelas ini menggunakan Pages Router, `getStaticProps`, dan `getStaticPaths`.

---

# 15. Run Next.js

```bash
cd harisenin-nextjs-part-1
```

```bash
npm run dev
```

Expected:

```text
http://localhost:3000
```

---

# 16. Next.js Project Structure

Kita akan membuat:

```text
harisenin-nextjs-part-1/
├── pages/
│   ├── _app.js
│   ├── index.js
│   ├── about.js
│   └── posts/
│       ├── index.js
│       └── [slug].js
│
├── components/
│   ├── Layout.js
│   ├── Navbar.js
│   └── PostCard.js
│
├── lib/
│   └── api.js
│
├── styles/
│   └── globals.css
│
├── .env.local
├── .env.example
└── public/
```

Create folders:

Git Bash:

```bash
mkdir -p components lib pages/posts
```

Windows CMD / PowerShell dapat dibuat manual dari VS Code.

---

# PART G — NEXT.JS ENVIRONMENT

## 17. Create `.env.local`

Create:

```text
.env.local
```

Isi:

```env
API_URL=http://localhost:3001
```

Create:

```text
.env.example
```

Isi:

```env
API_URL=http://localhost:3001
```

Check `.gitignore`.

Pastikan environment local tidak perlu di-push jika sudah di-ignore oleh project.

---

# PART H — BASIC PAGES

## 18. Home Page

Open:

```text
pages/index.js
```

Isi:

```jsx
export default function Home() {
  return (
    <main>
      <h1>
        Node.js + Next.js
      </h1>

      <p>
        Backend dari Node.js.
        Frontend dari Next.js.
      </p>
    </main>
  );
}
```

Test:

```text
http://localhost:3000
```

---

# 19. About Page

Create:

```text
pages/about.js
```

Isi:

```jsx
export default function About() {
  return (
    <main>
      <h1>About</h1>

      <p>
        Full-stack project using
        Node.js REST API and
        Next.js Pages Router.
      </p>
    </main>
  );
}
```

Test:

```text
http://localhost:3000/about
```

---

# PART I — NAVIGATION + LAYOUT

## 20. Navbar

Create:

```text
components/Navbar.js
```

Isi:

```jsx
import Link
  from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/">
        Home
      </Link>

      {" | "}

      <Link href="/about">
        About
      </Link>

      {" | "}

      <Link href="/posts">
        Posts
      </Link>
    </nav>
  );
}
```

---

# 21. Layout

Create:

```text
components/Layout.js
```

Isi:

```jsx
import Navbar
  from "./Navbar";

export default function Layout({
  children,
}) {
  return (
    <>
      <Navbar />

      {children}
    </>
  );
}
```

---

# 22. `_app.js`

Open:

```text
pages/_app.js
```

Isi:

```jsx
import "../styles/globals.css";

import Layout
  from "../components/Layout";

export default function App({
  Component,
  pageProps,
}) {
  return (
    <Layout>
      <Component
        {...pageProps}
      />
    </Layout>
  );
}
```

---

# 23. Global CSS

Open:

```text
styles/globals.css
```

Isi:

```css
* {
  box-sizing:
    border-box;
}

body {
  margin:
    0;

  font-family:
    Arial,
    sans-serif;

  background:
    #f7f7f7;

  color:
    #111;
}

nav {
  padding:
    20px 40px;

  background:
    #111;
}

nav a {
  color:
    white;

  text-decoration:
    none;

  margin-right:
    12px;
}

main {
  max-width:
    900px;

  margin:
    0 auto;

  padding:
    48px 24px;
}
```

---

# PART J — CONNECT NEXT.JS TO NODE.JS

## 24. Create API Helper

Create:

```text
lib/api.js
```

Isi:

```js
const API_URL =
  process.env.API_URL;

export async function getAllPosts() {
  const response =
    await fetch(
      `${API_URL}/api/posts`
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch posts"
    );
  }

  const result =
    await response.json();

  return result.data;
}

export async function getPostBySlug(
  slug
) {
  const response =
    await fetch(
      `${API_URL}/api/posts/${slug}`
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch post"
    );
  }

  const result =
    await response.json();

  return result.data;
}
```

Flow:

```text
Next.js
   ↓
lib/api.js
   ↓
fetch()
   ↓
Node.js API
   ↓
JSON
```

---

# PART K — POSTS LIST + getStaticProps

## 25. Create PostCard

Create:

```text
components/PostCard.js
```

Isi:

```jsx
import Link
  from "next/link";

export default function PostCard({
  post,
}) {
  return (
    <article>
      <h2>
        {post.title}
      </h2>

      <p>
        {post.content}
      </p>

      <Link
        href={
          `/posts/${post.slug}`
        }
      >
        Read Post
      </Link>

      <style jsx>{`
        article {
          background:
            white;

          padding:
            24px;

          margin-bottom:
            16px;

          border:
            1px solid #ddd;

          border-radius:
            12px;
        }

        h2 {
          margin-top:
            0;
        }
      `}</style>
    </article>
  );
}
```

---

# 26. Posts Page

Create:

```text
pages/posts/index.js
```

Isi:

```jsx
import PostCard
  from "../../components/PostCard";

import {
  getAllPosts,
} from "../../lib/api";

export async function getStaticProps() {
  const posts =
    await getAllPosts();

  return {
    props: {
      posts,
    },
  };
}

export default function PostsPage({
  posts,
}) {
  return (
    <main>
      <h1>Posts</h1>

      {posts.map(
        (post) => (
          <PostCard
            key={post.id}
            post={post}
          />
        )
      )}
    </main>
  );
}
```

---

# 27. Run Both Projects

Terminal 1:

```bash
cd harisenin-nodejs-rest-api-part-3

git switch phase-5-nextjs-integration

npm run dev
```

Expected:

```text
http://localhost:3001
```

Terminal 2:

```bash
cd harisenin-nextjs-part-1

npm run dev
```

Expected:

```text
http://localhost:3000
```

---

# 28. Test `/posts`

Open:

```text
http://localhost:3000/posts
```

Flow:

```text
/posts
   ↓
getStaticProps()
   ↓
getAllPosts()
   ↓
fetch()
   ↓
localhost:3001/api/posts
   ↓
Node.js
   ↓
Sequelize
   ↓
MySQL
   ↓
JSON
   ↓
props
   ↓
PostCard
```

Checkpoint:

```text
[ ] /posts works

[ ] data comes from Node.js

[ ] data comes from MySQL

[ ] Next.js has no hardcoded posts
```

---

# PART L — DYNAMIC ROUTE + getStaticPaths

## 29. Create `[slug].js`

Create:

```text
pages/posts/[slug].js
```

Isi:

```jsx
import {
  getAllPosts,
  getPostBySlug,
} from "../../lib/api";

export async function getStaticPaths() {
  const posts =
    await getAllPosts();

  const paths =
    posts.map(
      (post) => ({
        params: {
          slug:
            post.slug,
        },
      })
    );

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({
  params,
}) {
  const post =
    await getPostBySlug(
      params.slug
    );

  return {
    props: {
      post,
    },
  };
}

export default function PostDetail({
  post,
}) {
  return (
    <main>
      <h1>
        {post.title}
      </h1>

      <p>
        {post.content}
      </p>

      {post.user && (
        <p>
          Author:
          {" "}
          {post.user.name}
        </p>
      )}
    </main>
  );
}
```

---

# 30. Test Dynamic Post

Open:

```text
http://localhost:3000/posts/belajar-nextjs-routing
```

Expected flow:

```text
URL
   ↓
[slug].js
   ↓
params.slug
   ↓
getPostBySlug()
   ↓
GET /api/posts/:slug
   ↓
Node.js
   ↓
MySQL
   ↓
JSON
   ↓
Post Detail
```

---

# 31. Test Second Post

Open:

```text
http://localhost:3000/posts/dynamic-route-dengan-slug
```

Dua URL:

```text
/posts/belajar-nextjs-routing

/posts/dynamic-route-dengan-slug
```

menggunakan satu file:

```text
pages/posts/[slug].js
```

---

# 32. Test Unknown Slug

Open:

```text
http://localhost:3000/posts/post-tidak-ada
```

Expected:

```text
404
```

karena:

```js
fallback: false
```

---

# PART M — STUDENT CHALLENGE

## 33. Add New Post from Database

Jangan tambah data hardcoded di Next.js.

DBeaver:

```sql
INSERT INTO posts
(
  user_id,
  title,
  slug,
  content,
  created_at,
  updated_at
)
VALUES
(
  1,
  'My First Full Stack Post',
  'my-first-full-stack-post',
  'Node.js is my backend and Next.js is my frontend.',
  NOW(),
  NOW()
);
```

Check backend:

```text
GET
http://localhost:3001/api/posts
```

Pastikan post baru muncul.

---

# 34. Test from Next.js

Development mode:

```text
http://localhost:3000/posts
```

Then:

```text
http://localhost:3000/posts/my-first-full-stack-post
```

Checklist:

```text
[ ] data added to MySQL

[ ] Node.js returns new data

[ ] Next.js displays new data

[ ] dynamic URL works

[ ] detail page works

[ ] no hardcoded post in Next.js
```

---

# PART N — BUILD TEST

## 35. Keep Backend Running

Backend:

```bash
npm run dev
```

Expected:

```text
http://localhost:3001
```

---

# 36. Build Next.js

Frontend:

```bash
npm run build
```

Backend harus hidup karena:

```text
getStaticProps
getStaticPaths
```

membutuhkan API saat static pages dibuat.

Expected:

```text
Build completed successfully
```

---

# 37. Run Production Build

```bash
npm run start
```

Test:

```text
http://localhost:3000

http://localhost:3000/about

http://localhost:3000/posts

http://localhost:3000/posts/belajar-nextjs-routing
```

---

# PART O — GIT

## 38. Commit Backend Phase 5

Backend:

```bash
cd harisenin-nodejs-rest-api-part-3
```

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "phase 5: nextjs integration posts api"
```

```bash
git push -u origin phase-5-nextjs-integration
```

---

# 39. Push Next.js Repository

Frontend:

```bash
cd harisenin-nextjs-part-1
```

Check:

```bash
git status
```

Commit:

```bash
git add .
```

```bash
git commit -m "nextjs part 1: connect nodejs api"
```

Create empty GitHub repository:

```text
harisenin-nextjs-part-1
```

Add remote:

```bash
git remote add origin https://github.com/USERNAME/harisenin-nextjs-part-1.git
```

Push:

```bash
git push -u origin main
```

---

# DEBUGGING FLOW

Kalau error:

```text
DO NOT DEBUG EVERYTHING AT ONCE
```

Check:

```text
1. Laragon running?

2. MySQL running?

3. Node.js running on 3001?

4. GET /api/posts works?

5. GET /api/posts/:slug works?

6. Next.js running on 3000?

7. API_URL correct?

8. getStaticProps receives posts?

9. getStaticPaths receives slug?

10. [slug].js uses params.slug?
```

Flow:

```text
BROWSER
   ↓
NEXT.JS ROUTE
   ↓
getStaticProps / getStaticPaths
   ↓
lib/api.js
   ↓
FETCH
   ↓
NODE.JS ROUTE
   ↓
CONTROLLER
   ↓
SEQUELIZE
   ↓
MYSQL
```

---

# COMMON ISSUE — `fetch failed`

Error:

```text
TypeError: fetch failed
```

Test backend:

```text
http://localhost:3001
```

Then:

```text
http://localhost:3001/api/posts
```

Kalau backend mati:

```bash
npm run dev
```

---

# COMMON ISSUE — PORT ALREADY IN USE

Pastikan:

```text
Node.js
3001

Next.js
3000
```

Backend `.env`:

```env
SERVER_PORT=3001
```

---

# COMMON ISSUE — `posts.map is not a function`

Backend response:

```json
{
  "message": "Success",
  "data": []
}
```

Maka helper harus:

```js
return result.data;
```

Bukan:

```js
return result;
```

---

# COMMON ISSUE — DYNAMIC PAGE 404

Check:

```sql
SELECT
  id,
  title,
  slug
FROM posts;
```

Pastikan slug ada.

Rule:

```text
pages/posts/[slug].js
        ↓
params.slug
```

---

# COMMON ISSUE — BUILD FAILS

Kalau:

```bash
npm run build
```

gagal fetch API, pastikan backend masih hidup:

```text
http://localhost:3001
```

---

# FINAL CHECKLIST

```text
NODE.JS

[ ] phase-5-nextjs-integration exists

[ ] backend runs on 3001

[ ] posts has slug column

[ ] GET /api/posts works

[ ] GET /api/posts/:slug works


NEXT.JS

[ ] frontend runs on 3000

[ ] Pages Router is used

[ ] / works

[ ] /about works

[ ] /posts works

[ ] Navbar works

[ ] getStaticProps fetches Node.js API

[ ] getStaticPaths uses API slugs

[ ] /posts/[slug] works

[ ] unknown slug returns 404

[ ] Styled JSX works

[ ] npm run build succeeds


FULL STACK

[ ] MySQL stores data

[ ] Sequelize reads data

[ ] Node.js returns JSON

[ ] Next.js consumes JSON

[ ] React renders UI

[ ] Browser displays final result
```

---

# FINAL FLOW

```text
MYSQL
   ↓
SEQUELIZE
   ↓
NODE.JS
   ↓
EXPRESS API
   ↓
JSON
   ↓
NEXT.JS
   ↓
getStaticProps / getStaticPaths
   ↓
PROPS
   ↓
REACT
   ↓
BROWSER
```

---

# KEY MENTAL MODEL

```text
Node.js
= Backend

Express
= API

Sequelize
= Bridge to Database

MySQL
= Data

Next.js
= Frontend

getStaticProps
= Get data for page

getStaticPaths
= Decide which dynamic URLs exist

[slug].js
= One template, many URLs
```

---

# NEXT — NEXT.JS PART 2

```text
Landing Page
   ↓
GitHub
   ↓
Deploy
   ↓
Live URL
   ↓
Share to LinkedIn
```
