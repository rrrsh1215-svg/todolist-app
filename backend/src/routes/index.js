const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("../modules/auth/routes/auth.routes");
const categoryRoutes = require("../modules/categories/routes/category.routes");
const todoRoutes = require("../modules/todos/routes/todo.routes");
const userRoutes = require("../modules/users/routes/user.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/todos", todoRoutes);

module.exports = router;
