const { env } = require("./env");

const databaseConfig = {
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};

module.exports = {
  databaseConfig
};
