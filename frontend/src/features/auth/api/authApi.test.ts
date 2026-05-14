import { afterEach, describe, expect, it, vi } from "vitest";
import { login, logout, signup } from "./authApi";

describe("authApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls signup endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "user-id",
            email: "user@example.com",
            displayName: "테스트 사용자",
            createdAt: "2026-05-14T00:00:00.000Z",
            updatedAt: "2026-05-14T00:00:00.000Z"
          }
        }),
        { status: 201 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await signup({
      email: "user@example.com",
      password: "password123!",
      displayName: "테스트 사용자"
    });

    expect(fetchMock.mock.calls[0][0]).toContain("/auth/signup");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });

  it("calls login endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            token: "jwt-token",
            user: {
              id: "user-id",
              email: "user@example.com",
              displayName: "테스트 사용자",
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z"
            }
          }
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await login({
      email: "user@example.com",
      password: "password123!"
    });

    expect(fetchMock.mock.calls[0][0]).toContain("/auth/login");
    expect(response.data.token).toBe("jwt-token");
  });

  it("calls logout endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await logout();

    expect(fetchMock.mock.calls[0][0]).toContain("/auth/logout");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });
});
