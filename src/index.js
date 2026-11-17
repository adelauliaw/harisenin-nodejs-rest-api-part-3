require("dotenv").config();
<<<<<<< HEAD
const { sequelize } = require("./models");
async function start() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required in .env");
  await sequelize.authenticate();
  console.log("Database connected");
  const app = require("./app");
  const port = Number(process.env.SERVER_PORT || 3000);
  const server = app.listen(port, () => console.log(`Dashboard: http://localhost:${port}/dashboard/`));
  server.on("error", async (error) => {
    console.error(`Server startup failed: ${error.message}`);
    await sequelize.close();
    process.exitCode = 1;
  });
}
start().catch(async (error) => {
  console.error(`Startup failed: ${error.message}`);
  await sequelize.close();
  process.exitCode = 1;
});
=======

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
  process.env.PORT ||
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
>>>>>>> origin/dev
