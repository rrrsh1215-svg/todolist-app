const { pool } = require("../../../db/pool");

async function findVisibleByUserId(userId) {
  const result = await pool.query(
    `
      SELECT id, user_id, name, is_default, created_at, updated_at
      FROM categories
      WHERE is_default = true OR user_id = $1
      ORDER BY is_default DESC, name ASC
    `,
    [userId]
  );

  return result.rows;
}

async function createForUser(userId, name) {
  const result = await pool.query(
    `
      INSERT INTO categories (user_id, name, is_default)
      VALUES ($1, $2, false)
      RETURNING id, user_id, name, is_default, created_at, updated_at
    `,
    [userId, name]
  );

  return result.rows[0] || null;
}

async function findAccessibleById(categoryId, userId) {
  const result = await pool.query(
    `
      SELECT id, user_id, name, is_default, created_at, updated_at
      FROM categories
      WHERE id = $1
        AND (is_default = true OR user_id = $2)
    `,
    [categoryId, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createForUser,
  findAccessibleById,
  findVisibleByUserId
};
