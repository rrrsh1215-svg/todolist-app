const todoService = require("../services/todo.service");
const logger = require("../../../utils/logger");

async function listTodos(req, res) {
  logger.info("Todo list requested", { userId: req.userId, filters: req.query || {} });
  const todos = await todoService.listTodos(req.userId, req.query || {});
  logger.info("Todo list completed", { userId: req.userId, count: todos.length });
  return res.status(200).json({ data: todos });
}

async function createTodo(req, res) {
  logger.info("Todo create requested", { userId: req.userId, categoryId: req.body?.categoryId });
  const todo = await todoService.createTodo(req.userId, req.body || {});
  logger.info("Todo create completed", { userId: req.userId, todoId: todo.id });
  return res.status(201).json({ data: todo });
}

async function getTodo(req, res) {
  logger.info("Todo read requested", { userId: req.userId, todoId: req.params.todoId });
  const todo = await todoService.getTodo(req.userId, req.params.todoId);
  logger.info("Todo read completed", { userId: req.userId, todoId: todo.id });
  return res.status(200).json({ data: todo });
}

async function updateTodo(req, res) {
  logger.info("Todo update requested", { userId: req.userId, todoId: req.params.todoId });
  const todo = await todoService.updateTodo(req.userId, req.params.todoId, req.body || {});
  logger.info("Todo update completed", { userId: req.userId, todoId: todo.id });
  return res.status(200).json({ data: todo });
}

async function deleteTodo(req, res) {
  logger.info("Todo delete requested", { userId: req.userId, todoId: req.params.todoId });
  await todoService.deleteTodo(req.userId, req.params.todoId);
  logger.info("Todo delete completed", { userId: req.userId, todoId: req.params.todoId });
  return res.status(204).send();
}

module.exports = {
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  updateTodo
};
