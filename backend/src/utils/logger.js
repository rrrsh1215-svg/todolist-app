const { env } = require("../config/env");

function info(message, metadata) {
  if (env.nodeEnv === "test") {
    return;
  }

  if (metadata) {
    console.info(message, metadata);
    return;
  }

  console.info(message);
}

function warn(message, metadata) {
  if (env.nodeEnv === "test") {
    return;
  }

  if (metadata) {
    console.warn(message, metadata);
    return;
  }

  console.warn(message);
}

function error(message, metadata) {
  if (env.nodeEnv === "test") {
    return;
  }

  if (metadata) {
    console.error(message, metadata);
    return;
  }

  console.error(message);
}

module.exports = {
  error,
  info,
  warn
};
