const categoryRepository = require("../../categories/repositories/category.repository");
const todoRepository = require("../repositories/todo.repository");
const { badRequest, notFound } = require("../../../utils/appError");
const { mapTodo } = require("../../../utils/mappers");
const { isDateOnly, isNonEmptyString, isUuid, normalizeString } = require("../../../utils/validators");

const TODO_STATUSES = ["registered", "in_progress", "completed", "canceled"];

async function ensureAccessibleCategory(categoryId, userId) {
  if (!isUuid(categoryId)) {
    throw badRequest("Invalid category", [{ field: "categoryId", message: "Valid categoryId is required" }]);
  }

  const category = await categoryRepository.findAccessibleById(categoryId, userId);

  if (!category) {
    throw notFound("Category not found");
  }
}

function validateCreate(body) {
  const title = normalizeString(body.title);
  const description = body.description === undefined ? null : body.description;
  const dueDate = body.dueDate === undefined ? null : body.dueDate;
  const categoryId = body.categoryId;
  const details = [];

  if (!isNonEmptyString(title)) details.push({ field: "title", message: "Title is required" });
  if (!isUuid(categoryId)) details.push({ field: "categoryId", message: "Valid categoryId is required" });
  if (!isDateOnly(dueDate)) details.push({ field: "dueDate", message: "Valid date is required" });
  if (description !== null && typeof description !== "string") {
    details.push({ field: "description", message: "Description must be a string" });
  }

  if (details.length > 0) {
    throw badRequest("Invalid todo request", details);
  }

  return {
    title,
    description,
    dueDate,
    categoryId
  };
}

function validateUpdate(body) {
  const allowed = ["title", "description", "dueDate", "categoryId", "isCompleted", "status"];
  const values = {};
  const details = [];

  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) {
      details.push({ field: key, message: "Unsupported field" });
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "title")) {
    const title = normalizeString(body.title);
    if (!isNonEmptyString(title)) details.push({ field: "title", message: "Title is required" });
    values.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, "description")) {
    if (body.description !== null && typeof body.description !== "string") {
      details.push({ field: "description", message: "Description must be a string" });
    }
    values.description = body.description;
  }

  if (Object.prototype.hasOwnProperty.call(body, "dueDate")) {
    if (!isDateOnly(body.dueDate)) details.push({ field: "dueDate", message: "Valid date is required" });
    values.dueDate = body.dueDate;
  }

  if (Object.prototype.hasOwnProperty.call(body, "categoryId")) {
    if (!isUuid(body.categoryId)) details.push({ field: "categoryId", message: "Valid categoryId is required" });
    values.categoryId = body.categoryId;
  }

  if (Object.prototype.hasOwnProperty.call(body, "isCompleted")) {
    if (typeof body.isCompleted !== "boolean") {
      details.push({ field: "isCompleted", message: "isCompleted must be boolean" });
    }
    values.isCompleted = body.isCompleted;
    values.status = body.isCompleted ? "completed" : "registered";
  }

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    if (!TODO_STATUSES.includes(body.status)) {
      details.push({ field: "status", message: "status must be one of registered, in_progress, completed, canceled" });
    }
    values.status = body.status;
    values.isCompleted = body.status === "completed";
  }

  if (Object.keys(values).length === 0) {
    details.push({ field: "body", message: "At least one field is required" });
  }

  if (details.length > 0) {
    throw badRequest("Invalid todo update request", details);
  }

  return values;
}

function parseFilters(query) {
  const filters = {};
  const details = [];

  if (query.categoryId !== undefined) {
    if (!isUuid(query.categoryId)) details.push({ field: "categoryId", message: "Valid categoryId is required" });
    filters.categoryId = query.categoryId;
  }

  if (query.dueDateFrom !== undefined) {
    if (!isDateOnly(query.dueDateFrom)) details.push({ field: "dueDateFrom", message: "Valid date is required" });
    filters.dueDateFrom = query.dueDateFrom;
  }

  if (query.dueDateTo !== undefined) {
    if (!isDateOnly(query.dueDateTo)) details.push({ field: "dueDateTo", message: "Valid date is required" });
    filters.dueDateTo = query.dueDateTo;
  }

  if (query.isCompleted !== undefined) {
    if (query.isCompleted !== "true" && query.isCompleted !== "false") {
      details.push({ field: "isCompleted", message: "isCompleted must be true or false" });
    } else {
      filters.status = query.isCompleted === "true" ? "completed" : "registered";
    }
  }

  if (query.status !== undefined) {
    if (!TODO_STATUSES.includes(query.status)) {
      details.push({ field: "status", message: "status must be one of registered, in_progress, completed, canceled" });
    } else {
      filters.status = query.status;
    }
  }

  if (filters.dueDateFrom && filters.dueDateTo && filters.dueDateFrom > filters.dueDateTo) {
    details.push({ field: "dueDateFrom", message: "dueDateFrom must be before dueDateTo" });
  }

  if (details.length > 0) {
    throw badRequest("Invalid todo filters", details);
  }

  return filters;
}

async function createTodo(userId, body) {
  const values = validateCreate(body);
  await ensureAccessibleCategory(values.categoryId, userId);
  return mapTodo(await todoRepository.create(userId, values));
}

async function listTodos(userId, query) {
  const filters = parseFilters(query);

  if (filters.categoryId) {
    await ensureAccessibleCategory(filters.categoryId, userId);
  }

  const todos = await todoRepository.listForUser(userId, filters);
  return todos.map(mapTodo);
}

async function getTodo(userId, todoId) {
  if (!isUuid(todoId)) {
    throw notFound("Todo not found");
  }

  const todo = await todoRepository.findByIdForUser(todoId, userId);

  if (!todo) {
    throw notFound("Todo not found");
  }

  return mapTodo(todo);
}

async function updateTodo(userId, todoId, body) {
  if (!isUuid(todoId)) {
    throw notFound("Todo not found");
  }

  const values = validateUpdate(body);
  const existing = await todoRepository.findByIdForUser(todoId, userId);

  if (!existing) {
    throw notFound("Todo not found");
  }

  if (values.categoryId) {
    await ensureAccessibleCategory(values.categoryId, userId);
  }

  return mapTodo(await todoRepository.updateForUser(todoId, userId, values));
}

async function deleteTodo(userId, todoId) {
  if (!isUuid(todoId)) {
    throw notFound("Todo not found");
  }

  const deleted = await todoRepository.deleteForUser(todoId, userId);

  if (!deleted) {
    throw notFound("Todo not found");
  }
}

module.exports = {
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  updateTodo
};
