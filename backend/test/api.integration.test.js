const assert = require("node:assert/strict");
const test = require("node:test");

process.env.NODE_ENV = "test";

const { createApp } = require("../src/app");
const { closePool, pool } = require("../src/db/pool");

async function listen() {
  const app = createApp();

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}/api` });
    });
  });
}

async function request(url, path, options = {}) {
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });

  if (response.status === 204) {
    return { response, body: null };
  }

  return { response, body: await response.json() };
}

function authHeaders(token) {
  return { authorization: `Bearer ${token}` };
}

async function resetDb() {
  await pool.query("DELETE FROM todos");
  await pool.query("DELETE FROM categories WHERE is_default = false");
  await pool.query("DELETE FROM users");
  await pool.query(`
    INSERT INTO categories (name, is_default)
    VALUES ('일반', true), ('업무', true), ('개인', true), ('학습', true)
    ON CONFLICT DO NOTHING
  `);
}

async function signupAndLogin(url, suffix) {
  const email = `user-${suffix}@example.com`;
  const password = "password123!";

  const signup = await request(url, "/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName: `User ${suffix}` })
  });
  assert.equal(signup.response.status, 201);
  assert.equal(signup.body.data.email, email);
  assert.equal(signup.body.data.darkModeEnabled, false);
  assert.equal(signup.body.data.language, "ko");
  assert.equal(signup.body.data.password_hash, undefined);

  const login = await request(url, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  assert.equal(login.response.status, 200);
  assert.ok(login.body.data.token);

  return {
    email,
    password,
    token: login.body.data.token,
    user: login.body.data.user
  };
}

test("auth, categories, todos, users, and ownership contracts work end to end", async () => {
  await resetDb();
  const { server, url } = await listen();

  try {
    const userA = await signupAndLogin(url, "a");
    const userB = await signupAndLogin(url, "b");

    const duplicateSignup = await request(url, "/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: userA.email, password: userA.password, displayName: "Dup" })
    });
    assert.equal(duplicateSignup.response.status, 409);
    assert.equal(duplicateSignup.body.code, "CONFLICT");

    const badLogin = await request(url, "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: userA.email, password: "wrong-password" })
    });
    assert.equal(badLogin.response.status, 401);

    const unauthorizedCategories = await request(url, "/categories");
    assert.equal(unauthorizedCategories.response.status, 401);

    const defaultCategories = await request(url, "/categories", {
      headers: authHeaders(userA.token)
    });
    assert.equal(defaultCategories.response.status, 200);
    assert.ok(defaultCategories.body.data.some((category) => category.name === "일반"));
    const defaultCategory = defaultCategories.body.data.find((category) => category.name === "업무");

    const customCategory = await request(url, "/categories", {
      method: "POST",
      headers: authHeaders(userA.token),
      body: JSON.stringify({ name: "집중업무" })
    });
    assert.equal(customCategory.response.status, 201);
    assert.equal(customCategory.body.data.userId, userA.user.id);

    const duplicateCategory = await request(url, "/categories", {
      method: "POST",
      headers: authHeaders(userA.token),
      body: JSON.stringify({ name: "집중업무" })
    });
    assert.equal(duplicateCategory.response.status, 409);

    const userBCategories = await request(url, "/categories", {
      headers: authHeaders(userB.token)
    });
    assert.equal(userBCategories.response.status, 200);
    assert.equal(userBCategories.body.data.some((category) => category.name === "집중업무"), false);

    const badTodo = await request(url, "/todos", {
      method: "POST",
      headers: authHeaders(userA.token),
      body: JSON.stringify({ title: "", categoryId: defaultCategory.id })
    });
    assert.equal(badTodo.response.status, 400);
    assert.equal(badTodo.body.code, "VALIDATION_ERROR");

    const inaccessibleCategoryTodo = await request(url, "/todos", {
      method: "POST",
      headers: authHeaders(userB.token),
      body: JSON.stringify({ title: "Cross category", categoryId: customCategory.body.data.id })
    });
    assert.equal(inaccessibleCategoryTodo.response.status, 404);

    const todoOne = await request(url, "/todos", {
      method: "POST",
      headers: authHeaders(userA.token),
      body: JSON.stringify({
        title: "보고서 작성",
        description: "초안",
        dueDate: "2026-05-15",
        categoryId: defaultCategory.id
      })
    });
    assert.equal(todoOne.response.status, 201);
    assert.equal(todoOne.body.data.isCompleted, false);
    assert.equal(todoOne.body.data.category.name, "업무");

    const todoTwo = await request(url, "/todos", {
      method: "POST",
      headers: authHeaders(userA.token),
      body: JSON.stringify({
        title: "집중 업무",
        dueDate: "2026-05-20",
        categoryId: customCategory.body.data.id
      })
    });
    assert.equal(todoTwo.response.status, 201);

    const updateTodo = await request(url, `/todos/${todoOne.body.data.id}`, {
      method: "PATCH",
      headers: authHeaders(userA.token),
      body: JSON.stringify({ isCompleted: true, title: "보고서 최종 작성" })
    });
    assert.equal(updateTodo.response.status, 200);
    assert.equal(updateTodo.body.data.isCompleted, true);
    assert.equal(updateTodo.body.data.title, "보고서 최종 작성");

    const filteredTodos = await request(
      url,
      `/todos?categoryId=${defaultCategory.id}&dueDateFrom=2026-05-01&dueDateTo=2026-05-16&isCompleted=true`,
      { headers: authHeaders(userA.token) }
    );
    assert.equal(filteredTodos.response.status, 200);
    assert.deepEqual(
      filteredTodos.body.data.map((todo) => todo.id),
      [todoOne.body.data.id]
    );

    const invalidFilter = await request(url, "/todos?dueDateFrom=2026-05-20&dueDateTo=2026-05-01", {
      headers: authHeaders(userA.token)
    });
    assert.equal(invalidFilter.response.status, 400);

    const crossRead = await request(url, `/todos/${todoOne.body.data.id}`, {
      headers: authHeaders(userB.token)
    });
    assert.equal(crossRead.response.status, 404);

    const deleteTodo = await request(url, `/todos/${todoTwo.body.data.id}`, {
      method: "DELETE",
      headers: authHeaders(userA.token)
    });
    assert.equal(deleteTodo.response.status, 204);

    const me = await request(url, "/users/me", { headers: authHeaders(userA.token) });
    assert.equal(me.response.status, 200);
    assert.equal(me.body.data.email, userA.email);
    assert.equal(me.body.data.password_hash, undefined);

    const updatedMe = await request(url, "/users/me", {
      method: "PATCH",
      headers: authHeaders(userA.token),
      body: JSON.stringify({ displayName: "Updated User", darkModeEnabled: true, language: "en" })
    });
    assert.equal(updatedMe.response.status, 200);
    assert.equal(updatedMe.body.data.displayName, "Updated User");
    assert.equal(updatedMe.body.data.darkModeEnabled, true);
    assert.equal(updatedMe.body.data.language, "en");

    const deleteMe = await request(url, "/users/me", {
      method: "DELETE",
      headers: authHeaders(userA.token)
    });
    assert.equal(deleteMe.response.status, 204);

    const afterDelete = await request(url, "/users/me", {
      headers: authHeaders(userA.token)
    });
    assert.equal(afterDelete.response.status, 401);

    const remainingRows = await pool.query(
      "SELECT COUNT(*)::int AS count FROM todos WHERE user_id = $1",
      [userA.user.id]
    );
    assert.equal(remainingRows.rows[0].count, 0);
  } finally {
    server.close();
    await resetDb();
    await closePool();
  }
});
