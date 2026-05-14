import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../features/auth/store/authStore";
import type { User } from "../../features/auth/types";
import { ApiError } from "./apiError";
import { httpClient } from "./httpClient";

const user: User = {
  id: "user-id",
  email: "user@example.com",
  displayName: "테스트 사용자",
  createdAt: "2026-05-14T00:00:00.000Z",
  updatedAt: "2026-05-14T00:00:00.000Z"
};

describe("httpClient", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it("adds JSON content type and bearer token from memory auth store", async () => {
    useAuthStore.getState().setAuth("jwt-token", user);
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })
    );

    await httpClient.post("/todos", { title: "할 일" });

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer jwt-token");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify({ title: "할 일" }));
    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("does not parse 204 responses as JSON", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(httpClient.delete<void>("/todos/todo-id")).resolves.toBeUndefined();
  });

  it("throws ApiError using backend error response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: [{ field: "title", message: "Required" }]
        }),
        { status: 400 }
      )
    );

    await expect(httpClient.get("/todos")).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid request"
    } satisfies Partial<ApiError>);
  });

  it("clears memory auth state on 401", async () => {
    useAuthStore.getState().setAuth("jwt-token", user);
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/todos",
        assign
      }
    });

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: "UNAUTHORIZED", message: "Unauthorized" }), {
        status: 401
      })
    );

    await expect(httpClient.get("/users/me")).rejects.toBeInstanceOf(ApiError);

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(assign).toHaveBeenCalledWith("/login");
  });
});
