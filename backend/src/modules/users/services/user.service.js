const userRepository = require("../repositories/user.repository");
const { badRequest, notFound } = require("../../../utils/appError");
const { mapUser } = require("../../../utils/mappers");
const { isNonEmptyString, normalizeString } = require("../../../utils/validators");

async function getMe(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw notFound("User not found");
  }

  return mapUser(user);
}

async function updateMe(userId, body) {
  const displayName = normalizeString(body.displayName);
  const darkModeEnabled = body.darkModeEnabled;
  const language = normalizeString(body.language);
  const details = [];

  if (!isNonEmptyString(displayName)) {
    details.push({ field: "displayName", message: "Display name is required" });
  }

  if (typeof darkModeEnabled !== "boolean") {
    details.push({ field: "darkModeEnabled", message: "Dark mode setting must be a boolean" });
  }

  if (!["ko", "en", "ja"].includes(language)) {
    details.push({ field: "language", message: "Language must be one of ko, en, ja" });
  }

  if (details.length > 0) {
    throw badRequest("Invalid user update request", details);
  }

  const user = await userRepository.updateProfile(userId, {
    displayName,
    darkModeEnabled,
    language
  });

  if (!user) {
    throw notFound("User not found");
  }

  return mapUser(user);
}

async function deleteMe(userId) {
  const deleted = await userRepository.deleteById(userId);

  if (!deleted) {
    throw notFound("User not found");
  }
}

module.exports = {
  deleteMe,
  getMe,
  updateMe
};
