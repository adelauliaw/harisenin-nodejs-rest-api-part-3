require("dotenv").config();
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
