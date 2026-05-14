import { useAuthStore } from "../../features/auth/store/authStore";
import { API_BASE_URL } from "../constants/env";
import { ROUTES } from "../constants/routes";
import type { ApiError as ApiErrorBody } from "../types/api";
import { ApiError } from "./apiError";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function buildBody(body: RequestOptions["body"]) {
  if (!body || body instanceof FormData || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

function handleUnauthorized() {
  useAuthStore.getState().clearAuth();

  if (typeof window !== "undefined" && window.location.pathname !== ROUTES.login) {
    window.location.assign(ROUTES.login);
  }
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {
      code: "HTTP_ERROR",
      message: "Request failed"
    };
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  const body = buildBody(options.body);

  if (body && !headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    body,
    headers
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);

    if (response.status === 401) {
      handleUnauthorized();
    }

    throw new ApiError(response.status, errorBody);
  }

  return (await response.json()) as T;
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: RequestOptions["body"], options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: RequestOptions["body"], options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" })
};
