const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || (statusCode === 400 ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR");
  const message = statusCode >= 500 ? "Internal server error" : err.message;
  const body = {
    code,
    message
  };

  if (err.details) {
    body.details = err.details;
  }

  if (statusCode >= 500) {
    logger.error("Unhandled API error", {
      method: req.method,
      path: req.originalUrl,
      code,
      message: err.message
    });
  } else {
    logger.warn("API error response", {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      code
    });
  }

  return res.status(statusCode).json(body);
}

module.exports = errorHandler;
