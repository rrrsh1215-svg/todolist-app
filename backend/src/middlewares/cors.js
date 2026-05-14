const { env } = require("../config/env");

function resolveAllowedOrigin(requestOrigin) {
  if (env.corsOrigins.includes("*")) {
    return "*";
  }

  if (requestOrigin && env.corsOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  if (!requestOrigin) {
    return env.corsOrigins[0];
  }

  return null;
}

function corsMiddleware(req, res, next) {
  const allowedOrigin = resolveAllowedOrigin(req.headers.origin);

  if (allowedOrigin) {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}

module.exports = corsMiddleware;
