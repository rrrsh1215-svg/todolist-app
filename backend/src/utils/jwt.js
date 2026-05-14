const crypto = require("node:crypto");
const { env } = require("../config/env");
const { unauthorized } = require("./appError");

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function decodeBase64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function parseExpiresIn(value) {
  const match = /^(\d+)([smhd])?$/.exec(String(value || ""));

  if (!match) {
    return 3600;
  }

  const amount = Number(match[1]);
  const unit = match[2] || "s";
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60
  };

  return amount * multipliers[unit];
}

function signContent(content) {
  return crypto.createHmac("sha256", env.jwtSecret).update(content).digest("base64url");
}

function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + parseExpiresIn(env.jwtExpiresIn)
  };
  const content = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(fullPayload))}`;

  return `${content}.${signContent(content)}`;
}

function verifyToken(token) {
  const parts = String(token || "").split(".");

  if (parts.length !== 3) {
    throw unauthorized("Invalid token");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const content = `${encodedHeader}.${encodedPayload}`;
  const expected = signContent(content);

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw unauthorized("Invalid token");
  }

  let header;
  let payload;

  try {
    header = JSON.parse(decodeBase64url(encodedHeader));
    payload = JSON.parse(decodeBase64url(encodedPayload));
  } catch (error) {
    throw unauthorized("Invalid token");
  }

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw unauthorized("Invalid token");
  }

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw unauthorized("Token expired");
  }

  return payload;
}

module.exports = {
  signToken,
  verifyToken
};
