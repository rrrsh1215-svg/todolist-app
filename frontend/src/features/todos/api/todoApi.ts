import { httpClient } from "../../../shared/api/httpClient";
import type { ApiResponse } from "../../../shared/types/api";
import type { Todo, TodoFilters, TodoStatus } from "../types";

export type CreateTodoRequest = {
  title: string;
  categoryId: string;
  description?: string | null;
  dueDate?: string | null;
};

export type UpdateTodoRequest = Partial<CreateTodoRequest> & {
  isCompleted?: boolean;
  status?: TodoStatus;
};

function buildTodoQuery(filters: TodoFilters) {
  const params = new URLSearchParams();

  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.dueDateFrom) params.set("dueDateFrom", filters.dueDateFrom);
  if (filters.dueDateTo) params.set("dueDateTo", filters.dueDateTo);
  if (filters.status) {
    params.set("status", filters.status);
  } else if (typeof filters.isCompleted === "boolean") {
    params.set("isCompleted", String(filters.isCompleted));
  }

  const query = params.toString();
  return query ? `/todos?${query}` : "/todos";
}

export function getTodos(filters: TodoFilters = {}) {
  return httpClient.get<ApiResponse<Todo[]>>(buildTodoQuery(filters));
}

export function getTodo(todoId: string) {
  return httpClient.get<ApiResponse<Todo>>(`/todos/${todoId}`);
}

export function createTodo(request: CreateTodoRequest) {
  return httpClient.post<ApiResponse<Todo>>("/todos", request);
}

export function updateTodo(todoId: string, request: UpdateTodoRequest) {
  return httpClient.patch<ApiResponse<Todo>>(`/todos/${todoId}`, request);
}

export function deleteTodo(todoId: string) {
  return httpClient.delete<void>(`/todos/${todoId}`);
}
