# Node.js REST API Part 3

Harisenin Bootcamp — Full-Stack Web Developer

## Final Stack

```text
Node.js
Express.js
MySQL / MariaDB
Laragon
DBeaver
Sequelize ORM
bcryptjs
JWT
Validator
Postman
Git
GitHub
```

## Final Flow

```text
Client / Postman
      ↓
Route
      ↓
Validator
      ↓
Authentication Middleware
      ↓
Controller
      ↓
Sequelize Model
      ↓
MySQL
      ↓
JSON Response
```

---

# PHASE 0 — PREPARE LOCAL ENVIRONMENT

## 1. Start Laragon

Open:

```text
Laragon
```

Click:

```text
Start All
```

Pastikan MySQL/MariaDB running.

---

## 2. Important: DBeaver Bukan Database Server

```text
Laragon
↓
menjalankan MySQL / MariaDB server

DBeaver
↓
client untuk connect dan melihat database
```

Kalau Laragon belum menjalankan MySQL, DBeaver bisa menghasilkan:

```text
Connection refused: getsockopt
Communications link failure
```

---

## 3. Check MySQL Port

Default:

```text
3306
```

Windows terminal:

```bash
netstat -ano | findstr :3306
```

Kalau MySQL running, harus ada:

```text
LISTENING
```

Contoh:

```text
TCP    0.0.0.0:3306    0.0.0.0:0    LISTENING
```

---

## 4. Setup DBeaver

Create MySQL connection:

```text
Host:
localhost

Port:
3306

Username:
root

Password:
[KOSONG]
```

Kalau Laragon kamu tidak pernah diset password, coba password kosong terlebih dahulu.

Klik:

```text
Test Connection
```

Expected:

```text
Connected
```

---

# TROUBLESHOOTING — DBEAVER CONNECTION REFUSED

Kalau muncul:

```text
Connection refused: getsockopt
```

Check:

```text
1. Laragon sudah Start All?
2. MySQL/MariaDB running?
3. Port benar?
4. Host localhost?
```

Test port:

```bash
netstat -ano | findstr :3306
```

Kalau tidak ada `LISTENING`, MySQL belum aktif atau menggunakan port lain.

---

# 5. Create Database

Buka SQL Editor di DBeaver.

Run:

```sql
CREATE DATABASE fsd_bootcamp;
```

Check:

```sql
SHOW DATABASES;
```

Expected ada:

```text
fsd_bootcamp
```

Gunakan database:

```sql
USE fsd_bootcamp;
```

---

# PHASE 0 — CREATE NODE.JS PROJECT

## 6. Create Project

```bash
mkdir harisenin-nodejs-rest-api-part-3

cd harisenin-nodejs-rest-api-part-3
```

Initialize Git:

```bash
git init
```

Initialize Node.js:

```bash
npm init -y
```

---

# 7. Install Basic Dependencies

```bash
npm install express cors dotenv
```

Development dependency:

```bash
npm install -D nodemon
```

---

# 8. Create Folder

Git Bash:

```bash
mkdir src
```

Create files:

```bash
touch src/index.js
touch .env
touch .env.example
touch .gitignore
```

---

# 9. `.gitignore`

```gitignore
node_modules
.env
```

---

# 10. `.env`

```env
SERVER_PORT=3000
```

---

# 11. `.env.example`

```env
SERVER_PORT=3000
```

---

# 12. Update `package.json`

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

Tidak perlu replace seluruh `package.json`.

Cukup update bagian:

```json
"scripts"
```

---

# 13. Basic Express Server

File:

```text
src/index.js
```

```js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Node.js REST API Part 3",
    data: null,
  });
});

const PORT =
  process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
```

Run:

```bash
npm run dev
```

Expected:

```text
Server running on http://localhost:3000
```

Browser/Postman:

```text
GET http://localhost:3000
```

Expected:

```json
{
  "message": "Node.js REST API Part 3",
  "data": null
}
```

---

# 14. Commit Basic Project

```bash
git add .

git commit -m "phase 0: express setup"
```

---

# PHASE 1 — SEQUELIZE + MYSQL

Create branch:

```bash
git switch -c phase-1-sequelize
```

---

# 15. Install Sequelize

```bash
npm install sequelize mysql2
```

Install CLI:

```bash
npm install -D sequelize-cli
```

Check:

```bash
npx sequelize-cli --version
```

---

# 16. Update `.env`

Laragon tanpa password:

```env
SERVER_PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=fsd_bootcamp
```

IMPORTANT:

```env
DATABASE_PASSWORD=
```

boleh kosong.

Jangan tulis:

```env
DATABASE_PASSWORD=password_mysql_kamu
```

kalau memang MySQL tidak menggunakan password.

---

# 17. Update `.env.example`

```env
SERVER_PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=fsd_bootcamp
```

---

# 18. Create `.sequelizerc`

File:

```text
.sequelizerc
```

```js
const path = require("path");

module.exports = {
  config: path.resolve(
    "src/config/database.js"
  ),

  "models-path": path.resolve(
    "src/models"
  ),

  "seeders-path": path.resolve(
    "src/database/seeders"
  ),

  "migrations-path": path.resolve(
    "src/database/migrations"
  ),
};
```

---

# 19. Initialize Sequelize

```bash
npx sequelize-cli init
```

Structure:

```text
src/
├── config/
│   └── database.js
│
├── database/
│   ├── migrations/
│   └── seeders/
│
└── models/
    └── index.js
```

---

# 20. Database Configuration

Replace:

```text
src/config/database.js
```

dengan:

```js
require("dotenv").config();

module.exports = {
  development: {
    dialect: "mysql",

    host:
      process.env.DATABASE_HOST,

    port:
      Number(
        process.env.DATABASE_PORT || 3306
      ),

    username:
      process.env.DATABASE_USER,

    password:
      process.env.DATABASE_PASSWORD,

    database:
      process.env.DATABASE_NAME,

    logging: false,
  },
};
```

---

# 21. Generate User Model

```bash
npx sequelize-cli model:generate --name user --attributes name:string,email:string,password:string
```

---

# 22. Generate Post Model

```bash
npx sequelize-cli model:generate --name post --attributes user_id:integer,title:string,content:text
```

Sekarang:

```text
src/models/
├── index.js
├── user.js
└── post.js
```

---

# 23. User Model

File:

```text
src/models/user.js
```

```js
"use strict";

const {
  Model,
} = require("sequelize");

module.exports = (
  sequelize,
  DataTypes
) => {
  class user extends Model {
    static associate(models) {
      user.hasMany(
        models.post,
        {
          foreignKey: "user_id",
          as: "posts",
        }
      );
    }
  }

  user.init(
    {
      name: {
        type:
          DataTypes.STRING,

        allowNull: false,
      },

      email: {
        type:
          DataTypes.STRING,

        allowNull: false,

        unique: true,
      },

      password: {
        type:
          DataTypes.STRING,

        allowNull: false,
      },
    },

    {
      sequelize,

      modelName: "user",

      tableName: "users",

      underscored: true,
    }
  );

  return user;
};
```

---

# 24. Post Model

File:

```text
src/models/post.js
```

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

# 25. User Migration

Cari file:

```text
src/database/migrations/*create-user*.js
```

Replace:

```js
"use strict";

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    await queryInterface.createTable(
      "users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type:
            Sequelize.INTEGER,
        },

        name: {
          allowNull: false,
          type:
            Sequelize.STRING,
        },

        email: {
          allowNull: false,
          unique: true,
          type:
            Sequelize.STRING,
        },

        password: {
          allowNull: false,
          type:
            Sequelize.STRING,
        },

        created_at: {
          allowNull: false,
          type:
            Sequelize.DATE,
        },

        updated_at: {
          allowNull: false,
          type:
            Sequelize.DATE,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "users"
    );
  },
};
```

---

# 26. Post Migration

Cari:

```text
*create-post*.js
```

Replace:

```js
"use strict";

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    await queryInterface.createTable(
      "posts",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type:
            Sequelize.INTEGER,
        },

        user_id: {
          allowNull: false,

          type:
            Sequelize.INTEGER,

          references: {
            model: "users",
            key: "id",
          },

          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },

        title: {
          allowNull: false,
          type:
            Sequelize.STRING,
        },

        content: {
          allowNull: true,
          type:
            Sequelize.TEXT,
        },

        created_at: {
          allowNull: false,
          type:
            Sequelize.DATE,
        },

        updated_at: {
          allowNull: false,
          type:
            Sequelize.DATE,
        },
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "posts"
    );
  },
};
```

---

# 27. Run Migration

```bash
npx sequelize-cli db:migrate
```

Expected:

```text
migrated
```

Check dari DBeaver:

```sql
USE fsd_bootcamp;

SHOW TABLES;
```

Expected:

```text
users
posts
SequelizeMeta
```

---

# MYSQL TROUBLESHOOTING

## Error

```text
Connection refused
```

Check:

```text
Laragon → Start All
```

Then:

```bash
netstat -ano | findstr :3306
```

---

## Error

```text
Unknown database 'fsd_bootcamp'
```

Run:

```sql
CREATE DATABASE fsd_bootcamp;
```

Then:

```bash
npx sequelize-cli db:migrate
```

---

## Error

```text
Access denied for user 'root'
```

Check `.env`:

```env
DATABASE_USER=root
DATABASE_PASSWORD=
```

Kalau Laragon menggunakan password, gunakan password tersebut.

---

## Error

```text
ECONNREFUSED 127.0.0.1:3306
```

MySQL belum running atau port berbeda.

Check Laragon.

---

# 28. Create Controllers

```bash
mkdir src/controllers
mkdir src/routes
```

---

# 29. User Controller

File:

```text
src/controllers/user.controller.js
```

```js
const {
  user: UserModel,
} = require("../models");

const index = async (
  req,
  res,
  next
) => {
  try {
    const users =
      await UserModel.findAll({
        attributes: [
          "id",
          "name",
          "email",
        ],
      });

    return res.status(200).json({
      message: "Success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  index,
};
```

---

# 30. User Router

```text
src/routes/user.router.js
```

```js
const express =
  require("express");

const {
  index,
} = require(
  "../controllers/user.controller"
);

const router =
  express.Router();

router.get(
  "/",
  index
);

module.exports =
  router;
```

---

# 31. Main Router

```text
src/routes/index.js
```

```js
const express =
  require("express");

const userRouter =
  require("./user.router");

const router =
  express.Router();

router.use(
  "/users",
  userRouter
);

module.exports =
  router;
```

---

# 32. Update Main Server

Replace:

```text
src/index.js
```

```js
require("dotenv").config();

const express =
  require("express");

const cors =
  require("cors");

const routes =
  require("./routes");

const {
  sequelize,
} = require("./models");

const app =
  express();

app.use(cors());

app.use(
  express.json()
);

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      message:
        "Node.js REST API Part 3",

      data: null,
    });
  }
);

app.use(
  "/api",
  routes
);

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(error);

    return res
      .status(500)
      .json({
        message:
          "Internal server error",

        data: null,
      });
  }
);

const PORT =
  process.env.SERVER_PORT ||
  3000;

const start = async () => {
  await sequelize.authenticate();

  console.log(
    "Database connected"
  );

  app.listen(
    PORT,
    () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    }
  );
};

start().catch(
  console.error
);
```

---

# 33. Run Phase 1

```bash
npm run dev
```

Expected:

```text
Database connected
Server running on http://localhost:3000
```

Test:

```text
GET http://localhost:3000/api/users
```

Expected:

```json
{
  "message": "Success",
  "data": []
}
```

---

# 34. Commit Phase 1

```bash
git add .

git commit -m "phase 1: sequelize and mysql"
```

---

# PHASE 2 — AUTHENTICATION + JWT

Create branch dari Phase 1:

```bash
git switch -c phase-2-auth
```

Install:

```bash
npm install bcryptjs jsonwebtoken
```

---

# 35. Add JWT Secret

Update:

```text
.env
```

```env
JWT_SECRET=harisenin_super_secret
```

Full:

```env
SERVER_PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=fsd_bootcamp

JWT_SECRET=harisenin_super_secret
```

---

# 36. Auth Controller

File:

```text
src/controllers/auth.controller.js
```

```js
const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const {
  user: UserModel,
} = require("../models");

const register = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await UserModel.create({
        name,
        email,
        password:
          passwordHash,
      });

    return res
      .status(201)
      .json({
        message:
          "User successfully registered",

        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await UserModel.findOne({
        where: {
          email,
        },
      });

    if (!user) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email / password",

          data: null,
        });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email / password",

          data: null,
        });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1h",
        }
      );

    return res
      .status(200)
      .json({
        message:
          "User successfully logged in",

        data: {
          token,
        },
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
```

---

# 37. Auth Router

```text
src/routes/auth.router.js
```

```js
const express =
  require("express");

const {
  register,
  login,
} = require(
  "../controllers/auth.controller"
);

const router =
  express.Router();

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

module.exports =
  router;
```

---

# 38. Update Main Router

```text
src/routes/index.js
```

```js
const express =
  require("express");

const authRouter =
  require("./auth.router");

const userRouter =
  require("./user.router");

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

module.exports =
  router;
```

---

# 39. Test Register

Postman:

```text
POST
http://localhost:3000/api/auth/register
```

Body:

```json
{
  "name": "Adel Aulia",
  "email": "adel@example.com",
  "password": "Belajar123!"
}
```

Expected:

```text
201 Created
```

---

# 40. Check Password in Database

DBeaver:

```sql
SELECT *
FROM users;
```

Password harus berbentuk hash:

```text
$2a$10$...
```

Bukan:

```text
Belajar123!
```

---

# 41. Test Login

```text
POST
http://localhost:3000/api/auth/login
```

Body:

```json
{
  "email": "adel@example.com",
  "password": "Belajar123!"
}
```

Expected:

```json
{
  "message": "User successfully logged in",
  "data": {
    "token": "eyJ..."
  }
}
```

Copy token.

---

# PHASE 2.1 — PROTECTED ROUTE

Create middleware folder:

```bash
mkdir src/middlewares
```

---

# 42. Authentication Middleware

File:

```text
src/middlewares/auth.js
```

```js
const jwt =
  require("jsonwebtoken");

const verifyToken = (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization ||
      "";

    const [
      scheme,
      token,
    ] =
      authHeader.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid token",

          data: null,
        });
    }

    const user =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user =
      user;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        message:
          "Invalid token",

        data: null,
      });
  }
};

module.exports = {
  verifyToken,
};
```

---

# 43. Protect `/api/users`

Update:

```text
src/routes/user.router.js
```

```js
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
```

---

# 44. Test Without Token

```text
GET
http://localhost:3000/api/users
```

Expected:

```text
401 Unauthorized
```

---

# 45. Test With JWT

Postman:

```text
Authorization
↓
Bearer Token
↓
Paste token
```

Request:

```text
GET
http://localhost:3000/api/users
```

Expected:

```text
200 Success
```

---

# 46. Commit Phase 2

```bash
git add .

git commit -m "phase 2: authentication and jwt"
```

---

# PHASE 3 — VALIDATOR

Create:

```bash
git switch -c phase-3-validator
```

Install:

```bash
npm install validator
```

---

# 47. Validator Middleware

File:

```text
src/middlewares/validator.js
```

```js
const validator =
  require("validator");

const {
  user: UserModel,
} = require("../models");

const validateRegister =
  async (
    req,
    res,
    next
  ) => {
    try {
      let {
        name,
        email,
        password,
      } = req.body;

      name =
        name?.trim();

      email =
        email
          ?.trim()
          .toLowerCase();

      if (
        !name ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            message:
              "Bad request",

            data: null,
          });
      }

      if (
        !validator.isEmail(
          email
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Invalid email",

            data: null,
          });
      }

      if (
        !validator.isStrongPassword(
          password,
          {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Weak password",

            data: null,
          });
      }

      const existingUser =
        await UserModel.findOne({
          where: {
            email,
          },
        });

      if (existingUser) {
        return res
          .status(400)
          .json({
            message:
              "Email already registered",

            data: null,
          });
      }

      req.body.name =
        name;

      req.body.email =
        email;

      next();
    } catch (error) {
      next(error);
    }
  };

const validateLogin = (
  req,
  res,
  next
) => {
  let {
    email,
    password,
  } = req.body;

  email =
    email
      ?.trim()
      .toLowerCase();

  if (
    !email ||
    !password
  ) {
    return res
      .status(400)
      .json({
        message:
          "Bad request",

        data: null,
      });
  }

  if (
    !validator.isEmail(
      email
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid email",

        data: null,
      });
  }

  req.body.email =
    email;

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
```

---

# 48. Add Validator to Auth Router

```text
src/routes/auth.router.js
```

```js
const express =
  require("express");

const {
  register,
  login,
} = require(
  "../controllers/auth.controller"
);

const {
  validateRegister,
  validateLogin,
} = require(
  "../middlewares/validator"
);

const router =
  express.Router();

router.post(
  "/register",
  validateRegister,
  register
);

router.post(
  "/login",
  validateLogin,
  login
);

module.exports =
  router;
```

---

# 49. Test Missing Field

```json
{
  "name": "Adel",
  "email": "adel2@example.com"
}
```

Expected:

```text
400 Bad Request
```

---

# 50. Test Invalid Email

```json
{
  "name": "Adel",
  "email": "adel",
  "password": "Belajar123!"
}
```

Expected:

```json
{
  "message": "Invalid email",
  "data": null
}
```

---

# 51. Test Weak Password

```json
{
  "name": "Adel",
  "email": "adel2@example.com",
  "password": "123"
}
```

Expected:

```json
{
  "message": "Weak password",
  "data": null
}
```

---

# 52. Test Valid Register

```json
{
  "name": "Adel",
  "email": "adel2@example.com",
  "password": "Belajar123!"
}
```

---

# 53. Test Duplicate Email

Kirim request yang sama lagi.

Expected:

```json
{
  "message": "Email already registered",
  "data": null
}
```

---

# 54. Commit Phase 3

```bash
git add .

git commit -m "phase 3: validator"
```

---

# FINAL BRANCH STRUCTURE

Check:

```bash
git branch
```

Expected:

```text
main
phase-1-sequelize
phase-2-auth
phase-3-validator
```

Flow:

```text
main
↓
Express setup

phase-1-sequelize
↓
Sequelize + MySQL

phase-2-auth
↓
bcrypt + JWT + protected route

phase-3-validator
↓
input validation
```

---

# GIT SAFETY — NEVER PUSH `.env`

Check:

```bash
git status
```

Check whether `.env` is ignored:

```bash
git check-ignore -v .env
```

Expected:

```text
.gitignore
.env
```

Check whether `.env` is tracked:

```bash
git ls-files .env
```

Expected:

```text
NO OUTPUT
```

Kalau `.env` muncul:

```bash
git rm --cached .env
```

Then:

```bash
git add .gitignore

git commit -m "remove env from git tracking"
```

---

# CONNECT PROJECT TO GITHUB

Create empty GitHub repository:

```text
harisenin-nodejs-rest-api-part-3
```

Check remote:

```bash
git remote -v
```

Kalau kosong:

```bash
git remote add origin https://github.com/USERNAME/harisenin-nodejs-rest-api-part-3.git
```

Example:

```bash
git remote add origin https://github.com/adelauliaw/harisenin-nodejs-rest-api-part-3.git
```

Check:

```bash
git remote -v
```

---

# PUSH ALL BRANCHES

```bash
git push --all origin
```

Expected branches di GitHub:

```text
main
phase-1-sequelize
phase-2-auth
phase-3-validator
```

---

# GITHUB TROUBLESHOOTING

## Error

```text
Failed to connect to github.com port 443
Could not connect to server
```

Ini bukan error branch.

Ini connection/network issue.

Test:

```bash
curl -I https://github.com
```

Kalau timeout juga:

```text
Try another network / hotspot
```

Cara tercepat:

```text
Disconnect office Wi-Fi
↓
Connect hotspot HP
↓
Retry push
```

Then:

```bash
git push --all origin
```

---

# Check Git Proxy

```bash
git config --global --get http.proxy
```

```bash
git config --global --get https.proxy
```

Kalau ada proxy yang tidak digunakan:

```bash
git config --global --unset http.proxy
```

```bash
git config --global --unset https.proxy
```

Retry:

```bash
git push --all origin
```

---

# DNS Troubleshooting

```bash
nslookup github.com
```

Windows:

```bash
ipconfig /flushdns
```

Retry:

```bash
git push --all origin
```

---

# COMMON GIT ISSUE — `v5` IS A TAG

Kalau menggunakan repository lama dan menjalankan:

```bash
git switch v5
```

bisa muncul:

```text
fatal: a branch is expected, got tag 'v5'
```

Karena:

```text
v5 = tag
```

bukan:

```text
branch
```

Untuk repository kelas ini masalah tersebut tidak digunakan lagi.

Kita memakai branch sendiri:

```text
phase-1-sequelize
phase-2-auth
phase-3-validator
```

---

# POSTMAN FINAL TEST

## Register

```text
POST
/api/auth/register
```

```json
{
  "name": "Adel",
  "email": "adel@example.com",
  "password": "Belajar123!"
}
```

---

## Login

```text
POST
/api/auth/login
```

```json
{
  "email": "adel@example.com",
  "password": "Belajar123!"
}
```

Output:

```text
JWT TOKEN
```

---

## No Token

```text
GET
/api/users
```

Expected:

```text
401
```

---

## Valid Token

```text
GET
/api/users
```

Header:

```text
Authorization: Bearer YOUR_TOKEN
```

Expected:

```text
200
```

---

# OPTIONAL EXERCISE — PROFILE

Create:

```text
src/controllers/profile.controller.js
```

```js
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
```

---

Create:

```text
src/routes/profile.router.js
```

```js
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
```

Update:

```text
src/routes/index.js
```

Add:

```js
const profileRouter =
  require("./profile.router");
```

Add:

```js
router.use(
  "/profile",
  profileRouter
);
```

Test:

```text
GET
http://localhost:3000/api/profile
```

Without token:

```text
401
```

With token:

```text
200
```

---

# DEBUGGING FLOW

Kalau error:

```text
DO NOT DEBUG EVERYTHING AT ONCE
```

Check:

```text
1. Is server running?
2. Is URL correct?
3. Is HTTP method correct?
4. Is JSON body correct?
5. Did validator reject request?
6. Is JWT valid?
7. Did controller run?
8. Can Sequelize connect?
9. Is MySQL running?
10. Does database/table exist?
```

Flow:

```text
REQUEST
   ↓
ROUTE
   ↓
VALIDATOR
   ↓
AUTH
   ↓
CONTROLLER
   ↓
MODEL
   ↓
DATABASE
```

---

# FINAL CHECKLIST

```text
[ ] Laragon running

[ ] MySQL running

[ ] DBeaver connected

[ ] fsd_bootcamp database exists

[ ] .env configured

[ ] .env ignored by Git

[ ] npm install completed

[ ] migration completed

[ ] users table exists

[ ] posts table exists

[ ] Express server running

[ ] register works

[ ] password is hashed

[ ] login works

[ ] JWT generated

[ ] protected route returns 401 without token

[ ] protected route returns 200 with token

[ ] validator rejects invalid email

[ ] validator rejects weak password

[ ] duplicate email rejected

[ ] Git branches created

[ ] GitHub remote configured

[ ] all branches pushed
```

---

# FINAL PROJECT FLOW

```text
REGISTER
   ↓
Validator
   ↓
bcrypt.hash()
   ↓
UserModel.create()
   ↓
MySQL
```

```text
LOGIN
   ↓
Validator
   ↓
UserModel.findOne()
   ↓
bcrypt.compare()
   ↓
jwt.sign()
   ↓
JWT TOKEN
```

```text
PROTECTED REQUEST
   ↓
Authorization: Bearer TOKEN
   ↓
verifyToken
   ↓
jwt.verify()
   ↓
req.user
   ↓
Controller
   ↓
Sequelize
   ↓
MySQL
```

---

# Key Commands

```bash
npm run dev
```

```bash
npx sequelize-cli db:migrate
```

```bash
npx sequelize-cli db:migrate:undo
```

```bash
git branch
```

```bash
git status
```

```bash
git switch phase-1-sequelize
```

```bash
git switch phase-2-auth
```

```bash
git switch phase-3-validator
```

```bash
git push --all origin
```
