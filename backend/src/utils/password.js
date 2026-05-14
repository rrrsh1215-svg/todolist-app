const crypto = require("node:crypto");

const keyLength = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(password, salt, keyLength).toString("base64url");

  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, passwordHash) {
  const parts = String(passwordHash || "").split("$");

  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const [, salt, expectedHash] = parts;
  const actual = Buffer.from(crypto.scryptSync(password, salt, keyLength).toString("base64url"));
  const expected = Buffer.from(expectedHash);

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}

module.exports = {
  hashPassword,
  verifyPassword
};
