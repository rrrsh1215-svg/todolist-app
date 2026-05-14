const assert = require("node:assert/strict");
const test = require("node:test");

process.env.NODE_ENV = "test";

const { buildEnv, validateEnv } = require("../src/config/env");
const { databaseConfig } = require("../src/config/database");
const { pool } = require("../src/db/pool");

test("buildEnv reads required backend settings", () => {
  const env = buildEnv({
    PORT: "4000",
    DATABASE_URL: "postgresql://example",
    JWT_SECRET: "secret",
    JWT_EXPIRES_IN: "2h",
    CORS_ORIGIN: "http://localhost:5173,http://localhost:3000",
    NODE_ENV: "test"
  });

  assert.deepEqual(env, {
    nodeEnv: "test",
    port: 4000,
    databaseUrl: "postgresql://example",
    jwtSecret: "secret",
    jwtExpiresIn: "2h",
    corsOrigins: ["http://localhost:5173", "http://localhost:3000"]
  });
});

test("buildEnv supports POSTGRES_CONNECTION_STRING as a local fallback", () => {
  const env = buildEnv({
    POSTGRES_CONNECTION_STRING: "postgresql://fallback",
    JWT_SECRET: "secret"
  });

  assert.equal(env.databaseUrl, "postgresql://fallback");
});

test("buildEnv defaults CORS origin to wildcard", () => {
  const env = buildEnv({
    DATABASE_URL: "postgresql://example",
    JWT_SECRET: "secret"
  });

  assert.deepEqual(env.corsOrigins, ["*"]);
});

test("validateEnv fails when required values are missing", () => {
  assert.throws(
    () =>
      validateEnv({
        nodeEnv: "test",
        port: 3000
      }),
    /DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN/
  );
});

test("database config exposes pg pool settings", () => {
  assert.ok(databaseConfig.connectionString);
  assert.equal(databaseConfig.max, 10);
  assert.equal(databaseConfig.connectionTimeoutMillis, 5000);
});

test("pg pool is configured from database settings", async () => {
  assert.equal(pool.options.connectionString, databaseConfig.connectionString);
  assert.equal(pool.options.max, databaseConfig.max);
  await pool.end();
});
