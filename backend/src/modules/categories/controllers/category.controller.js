const categoryService = require("../services/category.service");
const logger = require("../../../utils/logger");

async function listCategories(req, res) {
  logger.info("Category list requested", { userId: req.userId });
  const categories = await categoryService.listCategories(req.userId);
  logger.info("Category list completed", { userId: req.userId, count: categories.length });
  return res.status(200).json({ data: categories });
}

async function createCategory(req, res) {
  logger.info("Category create requested", { userId: req.userId, name: req.body?.name });
  const category = await categoryService.createCategory(req.userId, req.body || {});
  logger.info("Category create completed", { userId: req.userId, categoryId: category.id });
  return res.status(201).json({ data: category });
}

module.exports = {
  createCategory,
  listCategories
};
