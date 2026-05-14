const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

process.env.NODE_ENV = "test";

const { createApp } = require("../src/app");

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

test("GET /health returns ok", async () => {
  const { server, url } = await listen(createApp());

  try {
    const response = await fetch(`${url}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: "ok" });
  } finally {
    server.close();
  }
});

test("GET /api/health returns ok for swagger server prefix", async () => {
  const { server, url } = await listen(createApp());

  try {
    const response = await fetch(`${url}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: "ok" });
  } finally {
    server.close();
  }
});

test("GET /api-docs returns swagger ui html", async () => {
  const { server, url } = await listen(createApp());

  try {
    const response = await fetch(`${url}/api-docs`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(body, /SwaggerUIBundle/);
    assert.match(body, /\/api-docs\/swagger\.json/);
  } finally {
    server.close();
  }
});

test("GET /api-docs/swagger.json returns openapi spec", async () => {
  const { server, url } = await listen(createApp());

  try {
    const response = await fetch(`${url}/api-docs/swagger.json`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.openapi, "3.0.3");
    assert.equal(body.info.title, "TodoListApp API");
  } finally {
    server.close();
  }
});

test("unknown route returns a standardized 404 response", async () => {
  const { server, url } = await listen(createApp());

  try {
    const response = await fetch(`${url}/missing`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, {
      code: "NOT_FOUND",
      message: "Route not found"
    });
  } finally {
    server.close();
  }
});

test("cors preflight returns 204", async () => {
  const { server, url } = await listen(createApp());

  try {
    const response = await fetch(`${url}/health`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173"
      }
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
  } finally {
    server.close();
  }
});

test("cors does not allow unknown origin", async () => {
  const { server, url } = await listen(createApp());

  try {
    const response = await fetch(`${url}/health`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://malicious.example"
      }
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  } finally {
    server.close();
  }
});

test("backend contains no TypeScript files or tsconfig", () => {
  const backendRoot = path.resolve(__dirname, "..");
  const forbidden = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walk(fullPath);
        continue;
      }

      if (entry.name === "tsconfig.json" || entry.name.endsWith(".ts") || entry.name.endsWith(".d.ts")) {
        forbidden.push(path.relative(backendRoot, fullPath));
      }
    }
  }

  walk(backendRoot);

  assert.deepEqual(forbidden, []);
});
