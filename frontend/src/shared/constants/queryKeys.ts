import type { TodoFilters } from "../../features/todos/types";

export const queryKeys = {
  me: ["me"] as const,
  categories: ["categories"] as const,
  todos: (filters: TodoFilters = {}) => ["todos", filters] as const,
  todo: (todoId: string) => ["todo", todoId] as const
};
