const fs = require("node:fs");
const path = require("node:path");

const backendEnvPath = path.resolve(__dirname, "../../.env");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return values;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return values;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");

      values[key] = value;
      return values;
    }, {});
}

function loadFileEnv() {
  return parseEnvFile(backendEnvPath);
}

function buildEnv(source = { ...loadFileEnv(), ...process.env }) {
  const databaseUrl = source.DATABASE_URL || source.POSTGRES_CONNECTION_STRING;
  const corsOrigins = String(source.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    nodeEnv: source.NODE_ENV || "development",
    port: Number(source.PORT || 3000),
    databaseUrl,
    jwtSecret: source.JWT_SECRET,
    jwtExpiresIn: source.JWT_EXPIRES_IN || "1h",
    corsOrigins
  };
}

function validateEnv(env) {
  const missing = [];

  if (!env.databaseUrl) missing.push("DATABASE_URL");
  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (!env.jwtExpiresIn) missing.push("JWT_EXPIRES_IN");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (!Number.isInteger(env.port) || env.port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return env;
}

const env = validateEnv(buildEnv());

module.exports = {
  buildEnv,
  env,
  loadFileEnv,
  parseEnvFile,
  validateEnv
};
