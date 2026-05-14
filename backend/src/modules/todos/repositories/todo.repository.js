const { pool } = require("../../../db/pool");

const todoSelect = `
  SELECT
    t.id,
    t.user_id,
    t.category_id,
    t.title,
    t.description,
    t.due_date,
    t.is_completed,
    t.status,
    t.created_at,
    t.updated_at,
    c.user_id AS category_user_id,
    c.name AS category_name,
    c.is_default AS category_is_default,
    c.created_at AS category_created_at,
    c.updated_at AS category_updated_at
  FROM todos t
  JOIN categories c ON c.id = t.category_id
`;

async function create(userId, values) {
  const result = await pool.query(
    `
      INSERT INTO todos (user_id, category_id, title, description, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [userId, values.categoryId, values.title, values.description ?? null, values.dueDate ?? null]
  );

  return findByIdForUser(result.rows[0].id, userId);
}

async function findByIdForUser(id, userId) {
  const result = await pool.query(
    `
      ${todoSelect}
      WHERE t.id = $1 AND t.user_id = $2
    `,
    [id, userId]
  );

  return result.rows[0] || null;
}

async function listForUser(userId, filters) {
  const conditions = ["t.user_id = $1"];
  const values = [userId];

  if (filters.categoryId) {
    values.push(filters.categoryId);
    conditions.push(`t.category_id = $${values.length}`);
  }

  if (filters.dueDateFrom) {
    values.push(filters.dueDateFrom);
    conditions.push(`t.due_date >= $${values.length}`);
  }

  if (filters.dueDateTo) {
    values.push(filters.dueDateTo);
    conditions.push(`t.due_date <= $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`t.status = $${values.length}`);
  }

  const result = await pool.query(
    `
      ${todoSelect}
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
    `,
    values
  );

  return result.rows;
}

async function updateForUser(id, userId, values) {
  const fields = [];
  const queryValues = [id, userId];

  if (Object.prototype.hasOwnProperty.call(values, "title")) {
    queryValues.push(values.title);
    fields.push(`title = $${queryValues.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(values, "description")) {
    queryValues.push(values.description);
    fields.push(`description = $${queryValues.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(values, "dueDate")) {
    queryValues.push(values.dueDate);
    fields.push(`due_date = $${queryValues.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(values, "categoryId")) {
    queryValues.push(values.categoryId);
    fields.push(`category_id = $${queryValues.length}`);
  }

  if (
    Object.prototype.hasOwnProperty.call(values, "isCompleted") &&
    !Object.prototype.hasOwnProperty.call(values, "status")
  ) {
    queryValues.push(values.isCompleted);
    fields.push(`is_completed = $${queryValues.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(values, "status")) {
    queryValues.push(values.status);
    fields.push(`status = $${queryValues.length}`);
    fields.push(`is_completed = ${values.status === "completed" ? "true" : "false"}`);
  }

  if (fields.length === 0) {
    return findByIdForUser(id, userId);
  }

  await pool.query(
    `
      UPDATE todos
      SET ${fields.join(", ")}
      WHERE id = $1 AND user_id = $2
    `,
    queryValues
  );

  return findByIdForUser(id, userId);
}

async function deleteForUser(id, userId) {
  const result = await pool.query("DELETE FROM todos WHERE id = $1 AND user_id = $2", [id, userId]);
  return result.rowCount > 0;
}

module.exports = {
  create,
  deleteForUser,
  findByIdForUser,
  listForUser,
  updateForUser
};
