const { env } = require("../config/env");

function requestLogger(req, res, next) {
  if (env.nodeEnv === "test") {
    return next();
  }

  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  return next();
}

module.exports = requestLogger;
