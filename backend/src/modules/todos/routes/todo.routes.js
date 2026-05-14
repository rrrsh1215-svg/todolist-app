const express = require("express");
const todoController = require("../controllers/todo.controller");
const authenticate = require("../../../middlewares/authenticate");
const asyncHandler = require("../../../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(todoController.listTodos));
router.post("/", authenticate, asyncHandler(todoController.createTodo));
router.get("/:todoId", authenticate, asyncHandler(todoController.getTodo));
router.patch("/:todoId", authenticate, asyncHandler(todoController.updateTodo));
router.delete("/:todoId", authenticate, asyncHandler(todoController.deleteTodo));

module.exports = router;
