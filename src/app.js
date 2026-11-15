<<<<<<< HEAD
const express = require("express");
const cors = require("cors");
const path = require("node:path");
const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.get("/", (req, res) => res.json({ message: "Node.js REST API Part 3", data: null }));
app.use("/dashboard", express.static(path.join(__dirname, "../frontend")));
app.use("/api", require("./routes"));
app.use((req, res) => res.status(404).json({ message: "Endpoint not found", data: null }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = 500, message = "Internal server error";
  if (error.type === "entity.parse.failed") { status = 400; message = "Invalid JSON body"; }
  else if (error.type === "entity.too.large") { status = 413; message = "Request body too large"; }
  else if (error.name === "SequelizeUniqueConstraintError") { status = 409; message = "Email or slug already exists"; }
  else if (error.name === "SequelizeValidationError") { status = 400; message = "Invalid input"; }
  if (status === 500) console.error(error.name, error.message);
  res.status(status).json({ message, data: null });
});
module.exports = app;
=======
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Node.js REST API Part 3",
    data: null,
  });
});

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

module.exports = app;
>>>>>>> origin/dev
