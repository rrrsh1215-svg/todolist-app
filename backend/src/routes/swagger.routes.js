const express = require("express");
const path = require("node:path");

const router = express.Router();
const swaggerSpecPath = path.resolve(__dirname, "../../../swagger/swagger.json");

router.get("/swagger.json", (req, res) => {
  return res.sendFile(swaggerSpecPath);
});

router.get("/", (req, res) => {
  return res.type("html").send(`<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TodoListApp API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/api-docs/swagger.json",
          dom_id: "#swagger-ui"
        });
      };
    </script>
  </body>
</html>`);
});

module.exports = router;
