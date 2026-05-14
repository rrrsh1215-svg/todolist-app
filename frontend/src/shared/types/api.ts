export type ApiResponse<T> = {
  data: T;
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown[];
};
