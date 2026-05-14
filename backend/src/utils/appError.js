class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function badRequest(message, details) {
  return new AppError(400, "VALIDATION_ERROR", message, details);
}

function unauthorized(message = "Authentication required") {
  return new AppError(401, "UNAUTHORIZED", message);
}

function notFound(message = "Resource not found") {
  return new AppError(404, "NOT_FOUND", message);
}

function conflict(message = "Resource conflict") {
  return new AppError(409, "CONFLICT", message);
}

module.exports = {
  AppError,
  badRequest,
  conflict,
  notFound,
  unauthorized
};
