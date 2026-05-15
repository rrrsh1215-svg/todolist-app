const express = require("express");
const apiRoutes = require("./routes");
const healthRoutes = require("./routes/health.routes");
const swaggerRoutes = require("./routes/swagger.routes");
const corsMiddleware = require("./middlewares/cors");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const requestLogger = require("./middlewares/requestLogger");

function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(requestLogger);

  app.use("/health", healthRoutes);
  app.use("/api", apiRoutes);
  app.use("/api-docs", swaggerRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
module.exports.default = app;
