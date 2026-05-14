function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

function toDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function mapUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    darkModeEnabled: row.dark_mode_enabled,
    language: row.language,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapCategory(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    isDefault: row.is_default,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function mapTodo(row) {
  if (!row) return null;

  const category =
    row.category_name === undefined
      ? undefined
      : {
          id: row.category_id,
          userId: row.category_user_id,
          name: row.category_name,
          isDefault: row.category_is_default,
          createdAt: toIso(row.category_created_at),
          updatedAt: toIso(row.category_updated_at)
        };

  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    ...(category ? { category } : {}),
    title: row.title,
    description: row.description,
    dueDate: toDateOnly(row.due_date),
    status: row.status || (row.is_completed ? "completed" : "registered"),
    isCompleted: row.status ? row.status === "completed" : row.is_completed,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

module.exports = {
  mapCategory,
  mapTodo,
  mapUser
};
