import { afterEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  afterEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("keeps JWT in memory state only", () => {
    const user = {
      id: "user-id",
      email: "user@example.com",
      displayName: "테스트 사용자",
      darkModeEnabled: false,
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z"
    };

    useAuthStore.getState().setAuth("jwt-token", user);

    expect(useAuthStore.getState().token).toBe("jwt-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("clears auth state with logout action", () => {
    const user = {
      id: "user-id",
      email: "user@example.com",
      displayName: "테스트 사용자",
      darkModeEnabled: false,
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z"
    };

    useAuthStore.getState().login("jwt-token", user);
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
