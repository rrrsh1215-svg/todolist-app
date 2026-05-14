const { pool } = require("../../../db/pool");

async function create({ email, passwordHash, displayName }) {
  const result = await pool.query(
    `
      INSERT INTO users (email, password_hash, display_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, display_name, dark_mode_enabled, language, created_at, updated_at
    `,
    [email, passwordHash, displayName]
  );

  return result.rows[0] || null;
}

async function findByEmail(email) {
  const result = await pool.query(
    `
      SELECT id, email, password_hash, display_name, dark_mode_enabled, language, created_at, updated_at
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    `
      SELECT id, email, display_name, dark_mode_enabled, language, created_at, updated_at
      FROM users
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function updateProfile(id, { displayName, darkModeEnabled, language }) {
  const result = await pool.query(
    `
      UPDATE users
      SET
        display_name = $2,
        dark_mode_enabled = $3,
        language = $4
      WHERE id = $1
      RETURNING id, email, display_name, dark_mode_enabled, language, created_at, updated_at
    `,
    [id, displayName, darkModeEnabled, language]
  );

  return result.rows[0] || null;
}

async function deleteById(id) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    await client.query("COMMIT");
    return result.rowCount > 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  create,
  deleteById,
  findByEmail,
  findById,
  updateProfile
};
