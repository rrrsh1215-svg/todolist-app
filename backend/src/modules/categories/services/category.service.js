const categoryRepository = require("../repositories/category.repository");
const { badRequest, conflict } = require("../../../utils/appError");
const { mapCategory } = require("../../../utils/mappers");
const { isNonEmptyString, normalizeString } = require("../../../utils/validators");

async function listCategories(userId) {
  const categories = await categoryRepository.findVisibleByUserId(userId);
  return categories.map(mapCategory);
}

async function createCategory(userId, body) {
  const name = normalizeString(body.name);

  if (!isNonEmptyString(name)) {
    throw badRequest("Invalid category request", [{ field: "name", message: "Category name is required" }]);
  }

  try {
    const category = await categoryRepository.createForUser(userId, name);
    return mapCategory(category);
  } catch (error) {
    if (error.code === "23505") {
      throw conflict("Category name already exists");
    }

    throw error;
  }
}

module.exports = {
  createCategory,
  listCategories
};
