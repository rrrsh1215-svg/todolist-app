const { Pool } = require("pg");
const { databaseConfig } = require("../config/database");

const pool = new Pool(databaseConfig);

async function closePool() {
  await pool.end();
}

module.exports = {
  closePool,
  pool
};
