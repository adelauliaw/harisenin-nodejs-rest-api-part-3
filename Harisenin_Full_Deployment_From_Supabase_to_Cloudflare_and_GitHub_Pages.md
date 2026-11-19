# FULL DEPLOYMENT README

## Next.js + Cloudflare Workers + Supabase PostgreSQL + GitHub Pages

**Project:** Harisenin Node.js REST API Part 3 + Next.js Part 1\
**Starting point:** This guide begins from the Supabase setup and
MySQL-to-PostgreSQL migration, then continues to Cloudflare Workers and
GitHub Pages.

> **Important:** Supabase uses PostgreSQL, not MySQL. The original
> backend uses Express + Sequelize + MySQL. We will migrate the database
> to PostgreSQL, then adapt the Worker database layer using `pg` +
> Cloudflare Hyperdrive. Express routes and the public API contract will
> be preserved. Keep the original backend project as a backup.

------------------------------------------------------------------------

# 0. FINAL ARCHITECTURE

``` text
BROWSER
   |
   v
NEXT.JS FRONTEND
GitHub Pages (Static Export)
   |
   | HTTPS / JSON / JWT
   v
EXPRESS REST API
Cloudflare Workers
   |
   | PostgreSQL connection
   v
CLOUDFLARE HYPERDRIVE
   |
   v
SUPABASE POSTGRESQL
users | posts
```

Example production URLs (replace the placeholders):

``` text
Frontend: https://GITHUB-USERNAME.github.io/REPOSITORY-NAME/
Backend:  https://WORKER-NAME.WORKER-SUBDOMAIN.workers.dev
Database: Supabase PostgreSQL
```

## What each platform does

  -----------------------------------------------------------------------
  Platform                            Responsibility
  ----------------------------------- -----------------------------------
  Supabase                            Stores PostgreSQL data: users and
                                      posts

  Cloudflare Hyperdrive               Manages database connections from
                                      Workers

  Cloudflare Workers                  Runs the Express REST API and JWT
                                      authentication

  GitHub Pages                        Hosts the exported Next.js frontend

  Next.js                             Displays pages and calls the
                                      backend API
  -----------------------------------------------------------------------

## Important limitations

-   GitHub Pages is static hosting. It does not run a Next.js Node.js
    server.
-   Next.js must use `output: "export"`.
-   `getStaticProps()` and `getStaticPaths()` run during the build.
-   New post slugs added after deployment require a new GitHub Actions
    build/deploy.
-   Login, register, profile, and users can call the Worker API from the
    browser.
-   Never expose Supabase database passwords, service-role keys, or JWT
    secrets in frontend code.

------------------------------------------------------------------------

# PART 1 --- CREATE SUPABASE FROM ZERO

## 1. Create a Supabase Project

1.  Open https://supabase.com/dashboard
2.  Sign in or create an account.
3.  Select **New project**.
4.  Choose your organization.
5.  Project name: `harisenin-bootcamp`.
6.  Create a strong database password and store it safely.
7.  Choose a region close to your users, such as Singapore if available.
8.  Select **Create new project** and wait until the database is ready.

### Screenshot reference --- Supabase dashboard

![Supabase database connection
settings](https://obuldanrptloktxcffvn.supabase.co/storage/v1/object/public/images/integrations/readyset/screenshot-3.png?t=2024-07-19T14%3A31%3A22.455Z)

*Visual reference for the Supabase connection settings. Dashboard labels
may change over time.*

## 2. Open the Supabase Connect panel

1.  Open your Supabase project.
2.  Click **Connect** near the top of the project dashboard.
3.  Choose the connection method you need.

There are two separate connection use cases in this project:

  -----------------------------------------------------------------------
  Used by                             Connection choice
  ----------------------------------- -----------------------------------
  DBeaver on your laptop              Session Pooler is a practical
                                      choice for IPv4-only local networks

  Cloudflare Hyperdrive               Use the Supabase Direct connection
                                      as shown in Cloudflare's Supabase
                                      integration guide
  -----------------------------------------------------------------------

**Do not confuse the two connection strings.** DBeaver can use Session
Pooler while Hyperdrive is configured separately with the Direct
connection.

Official guides: - Supabase connections:
https://supabase.com/docs/guides/database/connecting-to-postgres -
Cloudflare Hyperdrive + Supabase:
https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/

## 3. Connect Supabase to DBeaver

In the Supabase **Connect** panel, select:

-   Connection method: **Session Pooler**
-   Type: **URI**

Copy the connection information. It may resemble:

``` text
postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

Use the exact host, username, port, and database shown by your Supabase
dashboard.

In DBeaver:

1.  Open **Database → New Database Connection**.
2.  Select **PostgreSQL**.
3.  Fill in the values from Supabase:

  DBeaver field   Value
  --------------- -------------------------------------------------------------
  Host            Session Pooler host from Supabase
  Port            Port shown by Supabase (commonly `5432` for Session Pooler)
  Database        `postgres`
  Username        Exact Session Pooler username
  Password        Your Supabase database password
  SSL             Require

4.  Click **Test Connection**.
5.  If the test succeeds, click **Finish**.

### Screenshot reference --- DBeaver PostgreSQL connection

![DBeaver PostgreSQL connection
dialog](https://dbeaver.com/wp-content/uploads/2022/03/connection-settings-postgresql.png)

If the connection fails, re-check the exact pooler host and username
from Supabase. Do not guess the host or username.

------------------------------------------------------------------------

# PART 2 --- BACK UP AND MIGRATE MYSQL DATA

## 4. Back up the MySQL database first

Before exporting data: 1. Start MySQL in XAMPP. 2. Open DBeaver or
phpMyAdmin. 3. Select the local database `fsd_bootcamp`. 4. Export a SQL
backup. 5. Store the backup outside the project folder.

Do not delete the local MySQL database. Keep it until Supabase and the
production API have been verified.

Expected source tables:

``` text
fsd_bootcamp
  |
  +-- users
  |
  +-- posts
```

## 5. Check the MySQL data before transfer

The earlier transfer error showed this value:

``` text
0000-00-00 00:00:00
```

MySQL may contain zero dates, but PostgreSQL rejects them as invalid
timestamps.

Open a SQL Editor connected to **MySQL**, not Supabase, and inspect
`posts`:

``` sql
SELECT
    id,
    title,
    created_at,
    updated_at
FROM posts
WHERE
    CAST(created_at AS CHAR) LIKE '0000-00-00%'
    OR CAST(updated_at AS CHAR) LIKE '0000-00-00%';
```

If any rows are returned, correct them before transfer:

``` sql
UPDATE posts
SET created_at = CURRENT_TIMESTAMP
WHERE CAST(created_at AS CHAR) LIKE '0000-00-00%';

UPDATE posts
SET updated_at = CURRENT_TIMESTAMP
WHERE CAST(updated_at AS CHAR) LIKE '0000-00-00%';
```

If the original publication date is known, use that real date instead of
the current timestamp.

Repeat the inspection for `users` if those columns also contain
timestamps:

``` sql
SELECT
    id,
    email,
    created_at,
    updated_at
FROM users
WHERE
    CAST(created_at AS CHAR) LIKE '0000-00-00%'
    OR CAST(updated_at AS CHAR) LIKE '0000-00-00%';
```

Correct any invalid values before transferring.

## 6. Create the PostgreSQL tables in Supabase

If you have already created `public.users` and `public.posts`, do not
create them again. Check their columns first.

For a fresh training database, open **Supabase → SQL Editor → New
query** and run this example schema:

``` sql
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_user_id_idx
    ON public.posts(user_id);
```

**Important:** this example assumes your MySQL `users` table uses
`name`, `email`, and `password`. If your actual Sequelize model uses
different field names, match the PostgreSQL schema to the real model
before transferring data.

The `created_at` and `updated_at` columns have `DEFAULT NOW()`, so
manual inserts can omit these columns.

## 7. Transfer the `users` table with DBeaver

Do this table first because `posts.user_id` references `users.id`.

In DBeaver:

1.  Expand the MySQL connection.
2.  Expand database `fsd_bootcamp`.
3.  Expand **Tables**.
4.  Right-click the `users` table (not the database name).
5.  Select **Export Data**.
6.  Select **Database** as the target.
7.  Click **Next**.
8.  Click **Choose...** for Target container.
9.  Select the Supabase PostgreSQL connection.
10. Select database `postgres` and schema `public`.
11. In Tables Mapping, map:

  Source          Target
  --------------- ---------------------------
  MySQL `users`   PostgreSQL `public.users`

12. Confirm column mappings.
13. Review Data Load Settings.
14. Start the transfer.

### Screenshot reference --- DBeaver Data Transfer

![DBeaver data transfer
wizard](https://dbeaver.com/wp-content/uploads/2022/03/data-transfer.png)

If your DBeaver version uses different labels, look for the target
database/container and table mapping steps.

## 8. Transfer the `posts` table

Only do this after `users` has transferred successfully.

Repeat the same process:

1.  Right-click MySQL `posts`.
2.  Select **Export Data**.
3.  Target: Supabase PostgreSQL.
4.  Target container: `public`.
5.  Map:

  Source          Target
  --------------- ---------------------------
  MySQL `posts`   PostgreSQL `public.posts`

6.  Confirm that `id`, `user_id`, `title`, `slug`, `content`,
    `created_at`, and `updated_at` map to the correct columns.
7.  Start the transfer.

If a transfer previously failed, check how many rows are already in
Supabase before retrying. Do not blindly re-run a transfer that could
duplicate primary keys.

## 9. Verify migrated data in Supabase

Open Supabase SQL Editor and run:

``` sql
SELECT COUNT(*) AS total_users
FROM public.users;

SELECT COUNT(*) AS total_posts
FROM public.posts;

SELECT
    p.id,
    p.user_id,
    p.title,
    p.slug,
    p.created_at,
    p.updated_at,
    u.email
FROM public.posts p
JOIN public.users u
    ON p.user_id = u.id
ORDER BY p.id;
```

Check: - User count matches MySQL. - Post count matches MySQL. -
`user_id` relationships are correct. - Slugs are present and unique. -
No invalid timestamps remain. - Passwords are hashes, not plain text.

If IDs were imported manually, synchronize PostgreSQL identity
sequences:

``` sql
SELECT setval(
    pg_get_serial_sequence('public.users', 'id'),
    COALESCE(MAX(id), 1),
    MAX(id) IS NOT NULL
)
FROM public.users;

SELECT setval(
    pg_get_serial_sequence('public.posts', 'id'),
    COALESCE(MAX(id), 1),
    MAX(id) IS NOT NULL
)
FROM public.posts;
```

**Checkpoint:** Supabase is ready only after the row counts and
relationships have been checked.

------------------------------------------------------------------------

# PART 3 --- CREATE CLOUDFLARE WORKERS

## 10. Create a Cloudflare account

1.  Open https://dash.cloudflare.com/
2.  Sign in or create an account.
3.  Open **Workers & Pages**.

### Screenshot reference --- Workers & Pages dashboard

![Cloudflare Workers and Pages
overview](https://xenodium.github.io/images/a-cloudflare-workers-primer-hello-world/cf-new-0.png)

1.  Click **Create application**.
2.  Select the Worker creation flow.
3.  If you are using the terminal wizard, choose the following options.

## 11. Create the Worker using the terminal wizard

Open a terminal outside the Next.js project and run:

``` bash
npm create cloudflare@latest
```

When prompted, use:

  Prompt                  Selection
  ----------------------- --------------------------
  Application directory   `./harisenin-api-worker`
  Start with              `Hello World example`
  Template                **Worker only**
  Language                JavaScript
  Git                     Yes
  Deploy now              No

**Do not choose `SSR / full-stack app`.** The Next.js frontend is a
separate project and will be hosted on GitHub Pages.

Enter the Worker folder:

``` bash
cd harisenin-api-worker
```

Install packages:

``` bash
npm install express cors pg@8.16.3 bcryptjs jose
npm install -D wrangler
```

Login:

``` bash
npx wrangler login
```

## 12. Worker project structure

Create or arrange the project like this:

``` text
harisenin-api-worker/
|
├── src/
│   ├── index.js
│   ├── app.js
│   ├── db.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── posts.js
│   │   ├── auth.js
│   │   └── users.js
│   ├── repositories/
│   │   ├── posts.js
│   │   └── users.js
│   └── middleware/
│       └── auth.js
|
├── package.json
└── wrangler.jsonc
```

If `create-cloudflare` created a different starter file, keep the
project configuration and replace/organize the application entry files
as described below.

## 13. Important: Sequelize compatibility

Your original backend:

``` text
Express
  |
  v
Sequelize
  |
  v
MySQL + mysql2
```

The new deployment:

``` text
Express
  |
  v
PostgreSQL driver: pg
  |
  v
Cloudflare Hyperdrive
  |
  v
Supabase PostgreSQL
```

Cloudflare documents PostgreSQL Hyperdrive with the `pg` driver.
Sequelize is not explicitly listed in the official Hyperdrive driver
examples. Do not assume the current Sequelize connection pool and MySQL
models will work unchanged in Workers.

For this deployment: - Keep Express. - Keep the endpoint paths and JSON
response contracts. - Reuse validation and business logic where
possible. - Replace database calls with repository functions using
`pg`. - Use PostgreSQL parameter placeholders such as `$1`, `$2`. - Test
password hashing and JWT packages in Workers.

If preserving Sequelize is required, first create a separate
proof-of-compatibility test before porting the whole backend.

Official references: - Express on Workers:
https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/ -
Hyperdrive PostgreSQL:
https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/ -
`pg` with Hyperdrive:
https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-drivers-and-libraries/node-postgres/

------------------------------------------------------------------------

# PART 4 --- CONNECT CLOUDFLARE HYPERDRIVE TO SUPABASE

## 14. Get the Supabase Direct Connection string

For Hyperdrive, follow Cloudflare's Supabase integration guide and use
the Supabase **Direct connection** string.

In Supabase: 1. Open the project. 2. Click **Connect**. 3. Select
**Direct connection**. 4. Choose URI format. 5. Copy the connection
string securely.

It resembles:

``` text
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

Use the exact host, username, port, and database from your Supabase
project. Do not type the placeholders literally.

Remember: - DBeaver may use Session Pooler. - Hyperdrive uses the Direct
connection method in the Cloudflare Supabase guide.

If your direct endpoint is unavailable in your network or account
configuration, consult the current Supabase + Cloudflare guide before
substituting a pooler URL.

## 15. Create Hyperdrive

### Option A --- Cloudflare Dashboard

Open Cloudflare Dashboard → **Workers & Pages → Hyperdrive**.

1.  Select **Create Configuration**.
2.  Choose the public database connection option.
3.  Enter a configuration name, for example `supabase-harisenin`.
4.  Paste the Supabase Direct connection string.
5.  Create the configuration.
6.  Copy the generated Hyperdrive ID.

### Screenshot reference --- Hyperdrive configuration

![Cloudflare Hyperdrive create connection
screen](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/71rXsGZgXWem4yvkhdtHsP/55f9433b5447c09703ef39a547881497/image3.png)

### Option B --- Wrangler CLI

From the Worker project root:

``` bash
npx wrangler hyperdrive create supabase-harisenin \
  --connection-string="YOUR_SUPABASE_DIRECT_CONNECTION_STRING"
```

Copy the Hyperdrive ID returned by Wrangler.

**Security:** do not commit the connection string, paste it in public
chat, or store it in frontend environment variables. If the database
password contains reserved URL characters, URL-encode them in the
connection string.

## 16. Configure `wrangler.jsonc`

Open the Worker project's `wrangler.jsonc`.

Use:

``` jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "harisenin-api-worker",
  "main": "src/index.js",
  "compatibility_date": "2026-11-19",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "YOUR_HYPERDRIVE_ID"
    }
  ]
}
```

Replace `YOUR_HYPERDRIVE_ID` with the actual ID.

For newer compatibility dates, Node.js compatibility may already be
enabled by default, but keeping the flag is explicit and clear for this
project.

## 17. Create the database helper

Create `src/db.js`:

``` js
import { env } from "cloudflare:workers";
import { Client } from "pg";

export async function query(text, values = []) {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  try {
    await client.connect();

    const result = await client.query(text, values);

    return result;
  } finally {
    await client.end();
  }
}
```

Explanation: - `env.HYPERDRIVE.connectionString` comes from the
Hyperdrive binding. - `pg` sends PostgreSQL queries. - Hyperdrive
manages the underlying database connection pool. - Values are passed
separately from SQL to reduce SQL injection risk.

------------------------------------------------------------------------

# PART 5 --- ADAPT EXPRESS AND PRESERVE THE API

## 18. Create `src/app.js`

``` js
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://GITHUB-USERNAME.github.io"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Node.js REST API Part 3",
    data: null,
  });
});

app.use("/api", apiRoutes);

app.use((error, req, res, next) => {
  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
    data: null,
  });
});

export default app;
```

Replace `GITHUB-USERNAME` with the actual GitHub username. Add your
custom domain origin if you use one.

CORS origin does not include the repository path `/REPOSITORY-NAME`.

## 19. Create `src/index.js`

``` js
import { httpServerHandler } from "cloudflare:node";
import app from "./app.js";

app.listen(3000);

export default httpServerHandler({
  port: 3000,
});
```

This is the Express-on-Workers entry pattern. It is different from the
normal Node.js server entry point.

Do not call `sequelize.authenticate()` at module startup in the Worker
entry point.

## 20. Create posts repository

Create `src/repositories/posts.js`:

``` js
import { query } from "../db.js";

export async function findAllPosts() {
  const result = await query(
    `SELECT
       p.id,
       p.user_id,
       p.title,
       p.slug,
       p.content,
       p.created_at,
       p.updated_at,
       json_build_object(
         'id', u.id,
         'name', u.name,
         'email', u.email
       ) AS "user"
     FROM public.posts p
     JOIN public.users u ON u.id = p.user_id
     ORDER BY p.created_at DESC`
  );

  return result.rows;
}

export async function findPostBySlug(slug) {
  const result = await query(
    `SELECT
       p.id,
       p.user_id,
       p.title,
       p.slug,
       p.content,
       p.created_at,
       p.updated_at,
       json_build_object(
         'id', u.id,
         'name', u.name,
         'email', u.email
       ) AS "user"
     FROM public.posts p
     JOIN public.users u ON u.id = p.user_id
     WHERE p.slug = $1
     LIMIT 1`,
    [slug]
  );

  return result.rows[0] || null;
}
```

This assumes your PostgreSQL `users` table has `name` and `email`.
Change the query if your real schema differs.

## 21. Create posts routes

Create `src/routes/posts.js`:

``` js
import express from "express";
import {
  findAllPosts,
  findPostBySlug,
} from "../repositories/posts.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const posts = await findAllPosts();

    return res.status(200).json({
      message: "Success",
      data: posts,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const post = await findPostBySlug(req.params.slug);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Success",
      data: post,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
```

Create `src/routes/index.js`:

``` js
import express from "express";
import postsRouter from "./posts.js";

const router = express.Router();

router.use("/posts", postsRouter);

// Add the adapted auth, profile, and users routers
// after their PostgreSQL repositories are ready.

export default router;
```

**Checkpoint:** this example implements the two posts endpoints. The
full API is not ready until auth, profile, and users are also adapted.

## 22. Preserve all existing endpoints

The deployed Worker must ultimately provide:

  Method   Endpoint               Purpose
  -------- ---------------------- ----------------------------
  POST     `/api/auth/register`   Register
  POST     `/api/auth/login`      Login and return JWT
  GET      `/api/profile`         Current authenticated user
  GET      `/api/users`           List users (protected)
  GET      `/api/posts`           List posts
  GET      `/api/posts/:slug`     Post detail by slug

For user lookups, use parameterized SQL:

``` js
const result = await query(
  `SELECT id, name, email, password
   FROM public.users
   WHERE email = $1
   LIMIT 1`,
  [email]
);

const user = result.rows[0] || null;
```

For user creation, hash the password first:

``` js
const result = await query(
  `INSERT INTO public.users (name, email, password)
   VALUES ($1, $2, $3)
   RETURNING id, name, email, created_at`,
  [name, email, passwordHash]
);

const user = result.rows[0];
```

For a public users list, never return the password hash:

``` js
const result = await query(
  `SELECT id, name, email, created_at
   FROM public.users
   ORDER BY id DESC`
);

return result.rows;
```

### Authentication requirements

-   Use `bcryptjs` to hash passwords and compare existing
    bcrypt-compatible hashes.
-   Use `jose` for JWT signing and verification in Workers.
-   Store `JWT_SECRET` as a Worker secret.
-   Never return password hashes.
-   Never place JWT secret in Next.js.

Set the secret:

``` bash
npx wrangler secret put JWT_SECRET
```

The exact register/login body and JWT response property must match the
existing backend. Inspect the original auth controller and validator
before porting the logic.

JWT middleware must: 1. Read the `Authorization` header. 2. Require
`Bearer <token>`. 3. Verify the token signature and expiration. 4.
Extract the user ID from the verified token. 5. Attach the authenticated
user ID to the request. 6. Return HTTP 401 for missing or invalid
tokens.

------------------------------------------------------------------------

# PART 6 --- TEST AND DEPLOY CLOUDFLARE WORKERS

## 23. Run the Worker locally

From the Worker project root:

``` bash
npx wrangler dev
```

The local address is commonly:

``` text
http://localhost:8787
```

Test:

``` text
GET http://localhost:8787/
GET http://localhost:8787/api/posts
GET http://localhost:8787/api/posts/belajar-nextjs-routing
```

Then test: - Register. - Login. - Profile with a valid JWT. - Users with
a valid JWT. - Missing JWT. - Invalid/expired JWT. - Duplicate email. -
Unknown slug.

Do not deploy until all six endpoint groups work and return the expected
JSON structure.

## 24. Deploy the Worker

``` bash
npx wrangler deploy
```

Wrangler will output a URL similar to:

``` text
https://harisenin-api-worker.YOUR_SUBDOMAIN.workers.dev
```

Save this URL. It becomes the production API base URL for Next.js.

Test:

``` text
GET https://YOUR_WORKER_URL/
GET https://YOUR_WORKER_URL/api/posts
GET https://YOUR_WORKER_URL/api/posts/belajar-nextjs-routing
```

------------------------------------------------------------------------

# PART 7 --- DEPLOY NEXT.JS TO GITHUB PAGES

## 25. Understand static export

GitHub Pages hosts static HTML, CSS, and JavaScript. It does not run a
Next.js Node.js server.

The existing Next.js Pages Router app can use static export: -
`getStaticProps()` is supported. - `getStaticPaths()` is supported for
dynamic routes when all paths are generated at build time. -
Login/register/profile/users can call the Worker API in the browser. -
New post slugs require another build and deployment.

Official guide: https://nextjs.org/docs/pages/guides/static-exports

## 26. Update `next.config.mjs`

For a GitHub project site:

``` text
https://GITHUB-USERNAME.github.io/REPOSITORY-NAME/
```

Use:

``` js
const repoName = "REPOSITORY-NAME";

const nextConfig = {
  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  basePath:
    process.env.NODE_ENV === "production"
      ? `/${repoName}`
      : "",
};

export default nextConfig;
```

Replace `REPOSITORY-NAME` with the exact GitHub repository name.

If the repository is named `GITHUB-USERNAME.github.io` or you use a
custom domain at the root, omit `basePath`.

## 27. Configure local environment variables

In the Next.js project root, `.env.local` remains:

``` env
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For GitHub Actions production build, use the deployed Worker URL:

``` text
API_URL=https://YOUR_WORKER_URL
NEXT_PUBLIC_API_URL=https://YOUR_WORKER_URL
```

Meaning: - `API_URL` is used during build by `getStaticProps()` and
`getStaticPaths()`. - `NEXT_PUBLIC_API_URL` is embedded for browser-side
login, register, profile, and users requests.

Never put database credentials, Supabase service-role keys, or JWT
secrets in these variables.

## 28. Push the existing Next.js project to GitHub

1.  Open https://github.com/
2.  Create a repository, for example `harisenin-nextjs-part-1`.
3.  Push the existing Next.js project to the `main` branch.
4.  Confirm it contains `package.json`, `pages/`, `components/`,
    `styles/`, and `next.config.mjs`.
5.  Make sure `.env.local` is not committed.

## 29. Create GitHub Actions workflow

Inside the Next.js repository, create:

``` text
.github/workflows/deploy.yml
```

Paste:

``` yaml
name: Deploy Next.js to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: github-pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js static export
        run: npm run build
        env:
          API_URL: ${{ vars.API_URL }}
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages

    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

## 30. Configure GitHub Pages settings

![GitHub Pages settings with GitHub Actions
selected](https://dhrift.org/images/screenshots/github_pages_deploy_settings.png)

In GitHub: 1. Open the Next.js repository. 2. Select **Settings**. 3.
Select **Pages** in the sidebar. 4. Under **Build and deployment**, set
Source to **GitHub Actions**.

## 31. Add production variables

Go to:

**Settings → Secrets and variables → Actions → Variables**

Add:

  Variable                Value
  ----------------------- ---------------------------
  `API_URL`               `https://YOUR_WORKER_URL`
  `NEXT_PUBLIC_API_URL`   `https://YOUR_WORKER_URL`

Use the actual Worker URL and do not add a trailing slash.

These are API base URLs, not secrets. Never add Supabase passwords,
service-role keys, or JWT secrets here.

## 32. Trigger GitHub Pages deployment

From the Next.js project:

``` bash
git add .
git commit -m "deploy Next.js to GitHub Pages"
git push origin main
```

Open the repository's **Actions** tab and monitor the workflow.

Expected: - Build succeeds. - The `out/` folder is uploaded. - Deploy
job succeeds. - GitHub Pages publishes the site.

------------------------------------------------------------------------

# PART 8 --- CORS AND PRODUCTION TESTING

## 33. Configure CORS

The Worker must allow these exact origins:

``` text
http://localhost:3000
https://GITHUB-USERNAME.github.io
```

For a GitHub project site, the CORS origin does not include
`/REPOSITORY-NAME`.

If you use a custom domain, add its origin too.

## 34. Test production API

Public endpoints:

``` text
GET https://YOUR_WORKER_URL/
GET https://YOUR_WORKER_URL/api/posts
GET https://YOUR_WORKER_URL/api/posts/belajar-nextjs-routing
```

Authentication endpoints:

``` text
POST https://YOUR_WORKER_URL/api/auth/register
POST https://YOUR_WORKER_URL/api/auth/login
GET  https://YOUR_WORKER_URL/api/profile
GET  https://YOUR_WORKER_URL/api/users
```

Protected endpoints must include:

``` http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 35. Test the deployed frontend

Open:

``` text
https://GITHUB-USERNAME.github.io/REPOSITORY-NAME/
```

Test: - Homepage and navigation. - Posts list. - Every generated post
detail slug. - Register. - Login. - JWT storage and bearer header. -
Profile. - Users. - Invalid/expired JWT. - Browser CORS. - Refreshing
nested routes. - Unknown slug / 404.

------------------------------------------------------------------------

# PART 9 --- ADDING NEW POSTS AFTER DEPLOYMENT

GitHub Pages is static hosting. A new row in Supabase does not
automatically create a new static detail page.

When adding a new post:

1.  Insert the post into Supabase.
2.  Confirm `GET /api/posts` returns the new slug.
3.  Run GitHub Actions again.
4.  Next.js calls `getStaticPaths()` during build.
5.  Next.js generates the new detail page.
6.  GitHub Pages publishes the updated static site.

------------------------------------------------------------------------

# TROUBLESHOOTING

## A. Hyperdrive cannot connect to Supabase

Check: - Hyperdrive binding exists in `wrangler.jsonc`. - Hyperdrive ID
is correct. - Hyperdrive uses the Supabase Direct connection details. -
Supabase project is active. - Host, username, password, port, and
database are correct. - The Worker is using
`env.HYPERDRIVE.connectionString`.

## B. Worker cannot find a module or Node API

Check: - `nodejs_compat` is enabled. - Dependencies are compatible with
Workers. - Native Node modules are not assumed to work. - Test
`bcryptjs`, `jose`, and `pg` independently.

## C. `/api/posts` returns 500

Check: - `public.posts` exists. - `public.users` exists. -
`posts.user_id` references `users.id`. - SQL column names match the real
schema. - Hyperdrive binding is available.

## D. GitHub Actions build fails fetching posts

Check: - Worker has already been deployed. - `API_URL` repository
variable points to the Worker. - `GET /api/posts` returns HTTP 200. -
`getStaticPaths()` can retrieve the slug list. - Production build is not
using localhost.

## E. Browser shows CORS error

Check: - Exact GitHub Pages origin is allowed. - `NEXT_PUBLIC_API_URL`
points to the deployed Worker. - Do not use localhost in production
frontend variables.

## F. Post detail page returns 404

Check: - `GET /api/posts` includes the requested slug. -
`getStaticPaths()` returns that slug. - `fallback` is `false`. - GitHub
Actions was rerun after adding the new post.

------------------------------------------------------------------------

# FINAL DEPLOYMENT CHECKLIST

## Supabase

``` text
[ ] Supabase project created
[ ] DBeaver connected to Supabase PostgreSQL
[ ] MySQL backup completed
[ ] Invalid zero dates corrected in MySQL
[ ] users table transferred
[ ] posts table transferred
[ ] Row counts compared
[ ] Foreign key verified
[ ] Unique slug verified
[ ] Timestamps verified
[ ] Identity sequences synchronized
[ ] Original MySQL backup retained
```

## Cloudflare Workers

``` text
[ ] Worker only project created
[ ] Express app adapted for Workers
[ ] nodejs_compat enabled
[ ] Hyperdrive created
[ ] Supabase Direct connection used for Hyperdrive
[ ] Hyperdrive ID added to wrangler.jsonc
[ ] pg installed
[ ] Database helper tested
[ ] Posts repository tested
[ ] Auth/profile/users repositories adapted
[ ] JWT secret stored as Worker secret
[ ] Password hashing tested
[ ] CORS allowlist configured
[ ] Worker deployed
[ ] All six endpoint groups tested in production
```

## GitHub Pages

``` text
[ ] output: "export" configured
[ ] basePath configured for repository site if needed
[ ] trailingSlash configured
[ ] images unoptimized if using next/image
[ ] .env.local not committed
[ ] GitHub repository created
[ ] GitHub Actions workflow created
[ ] GitHub Pages source set to GitHub Actions
[ ] API_URL repository variable configured
[ ] NEXT_PUBLIC_API_URL repository variable configured
[ ] Static build succeeds
[ ] Posts and slug pages generated
[ ] Login/register/profile/users tested
```

------------------------------------------------------------------------

# OFFICIAL DOCUMENTATION

## Supabase

-   Dashboard: https://supabase.com/dashboard
-   PostgreSQL connections:
    https://supabase.com/docs/guides/database/connecting-to-postgres
-   MySQL migration: https://supabase.com/kb/guides/migrate-from-mysql
-   Import data: https://supabase.com/docs/guides/database/import-data
-   Pricing: https://supabase.com/pricing

## Cloudflare

-   Workers dashboard:
    https://developers.cloudflare.com/workers/get-started/dashboard/
-   Express on Workers:
    https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/
-   Hyperdrive getting started:
    https://developers.cloudflare.com/hyperdrive/get-started/
-   Hyperdrive + Supabase:
    https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/
-   `pg` with Hyperdrive:
    https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-drivers-and-libraries/node-postgres/
-   Wrangler: https://developers.cloudflare.com/workers/wrangler/

## Next.js and GitHub

-   Next.js static export:
    https://nextjs.org/docs/pages/guides/static-exports
-   `getStaticProps`:
    https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props
-   `getStaticPaths`:
    https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-paths
-   GitHub Pages publishing source:
    https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
-   GitHub Actions: https://docs.github.com/en/actions

------------------------------------------------------------------------

# FINAL ARCHITECTURE REMINDER

``` text
NEXT.JS
GitHub Pages
    |
    | HTTPS / JSON / JWT
    v
EXPRESS REST API
Cloudflare Workers
    |
    | Hyperdrive + pg
    v
SUPABASE POSTGRESQL
```

**Deployment principle:** start with a verified Supabase database,
deploy and test the Worker API, then build and deploy the Next.js static
frontend. Keep the old MySQL backend and database as backups until the
full production application has passed testing.
