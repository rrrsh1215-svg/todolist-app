import type { Category } from "../categories/types";

export type TodoStatus = "registered" | "in_progress" | "completed" | "canceled";

export type Todo = {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status?: TodoStatus;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TodoFilters = {
  categoryId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  isCompleted?: boolean;
  status?: TodoStatus;
};
