const express = require("express");
const categoryController = require("../controllers/category.controller");
const authenticate = require("../../../middlewares/authenticate");
const asyncHandler = require("../../../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(categoryController.listCategories));
router.post("/", authenticate, asyncHandler(categoryController.createCategory));

module.exports = router;
