require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors()); // middleware untuk membaca cors 
app.use(express.json()); // middleware untuk membaca json

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