const { createApp } = require("./app");
const { env } = require("./config/env");

const app = createApp();

const server = app.listen(env.port, () => {
  console.info(`TodoListApp backend listening on port ${env.port}`);
});

module.exports = {
  server
};
