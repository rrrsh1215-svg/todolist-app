const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isEmail(value) {
  return typeof value === "string" && emailPattern.test(value);
}

function isUuid(value) {
  return typeof value === "string" && uuidPattern.test(value);
}

function isDateOnly(value) {
  if (value === null || value === undefined) return true;
  if (typeof value !== "string" || !datePattern.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

module.exports = {
  isDateOnly,
  isEmail,
  isNonEmptyString,
  isUuid,
  normalizeString
};
