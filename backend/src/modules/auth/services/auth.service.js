const userRepository = require("../../users/repositories/user.repository");
const { badRequest, conflict, unauthorized } = require("../../../utils/appError");
const { signToken } = require("../../../utils/jwt");
const { mapUser } = require("../../../utils/mappers");
const { hashPassword, verifyPassword } = require("../../../utils/password");
const { isEmail, isNonEmptyString, normalizeString } = require("../../../utils/validators");

function validateSignup(body) {
  const email = normalizeString(body.email);
  const password = body.password;
  const displayName = normalizeString(body.displayName);
  const details = [];

  if (!isEmail(email)) details.push({ field: "email", message: "Valid email is required" });
  if (!isNonEmptyString(password) || password.length < 8) {
    details.push({ field: "password", message: "Password must be at least 8 characters" });
  }
  if (!isNonEmptyString(displayName)) {
    details.push({ field: "displayName", message: "Display name is required" });
  }

  if (details.length > 0) {
    throw badRequest("Invalid signup request", details);
  }

  return { email, password, displayName };
}

function validateLogin(body) {
  const email = normalizeString(body.email);
  const password = body.password;
  const details = [];

  if (!isEmail(email)) details.push({ field: "email", message: "Valid email is required" });
  if (!isNonEmptyString(password)) details.push({ field: "password", message: "Password is required" });

  if (details.length > 0) {
    throw badRequest("Invalid login request", details);
  }

  return { email, password };
}

async function signup(body) {
  const values = validateSignup(body);
  const existing = await userRepository.findByEmail(values.email);

  if (existing) {
    throw conflict("Email already exists");
  }

  try {
    const user = await userRepository.create({
      email: values.email,
      passwordHash: hashPassword(values.password),
      displayName: values.displayName
    });

    return mapUser(user);
  } catch (error) {
    if (error.code === "23505") {
      throw conflict("Email already exists");
    }

    throw error;
  }
}

async function login(body) {
  const values = validateLogin(body);
  const user = await userRepository.findByEmail(values.email);

  if (!user || !verifyPassword(values.password, user.password_hash)) {
    throw unauthorized("Invalid email or password");
  }

  const mappedUser = mapUser(user);
  const token = signToken({
    sub: mappedUser.id,
    userId: mappedUser.id
  });

  return {
    token,
    user: mappedUser
  };
}

function logout() {
  return undefined;
}

module.exports = {
  login,
  logout,
  signup
};
