import { httpClient } from "../../../shared/api/httpClient";
import type { ApiResponse } from "../../../shared/types/api";
import type { Category } from "../types";

export type CreateCategoryRequest = {
  name: string;
};

export function getCategories() {
  return httpClient.get<ApiResponse<Category[]>>("/categories");
}

export function createCategory(request: CreateCategoryRequest) {
  return httpClient.post<ApiResponse<Category>>("/categories", request);
}
