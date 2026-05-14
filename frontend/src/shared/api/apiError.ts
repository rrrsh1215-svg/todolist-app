import type { ApiError as ApiErrorBody } from "../types/api";

export class ApiError extends Error {
  readonly code: string;
  readonly details?: unknown[];
  readonly status: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
