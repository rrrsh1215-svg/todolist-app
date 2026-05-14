import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteAccount, getMe, updateMe } from "./userApi";

const userResponse = {
  data: {
    id: "user-id",
    email: "user@example.com",
    displayName: "테스트 사용자",
    darkModeEnabled: false,
    language: "ko",
    createdAt: "2026-05-14T00:00:00.000Z",
    updatedAt: "2026-05-14T00:00:00.000Z"
  }
};

describe("userApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls get me endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(userResponse)));
    vi.stubGlobal("fetch", fetchMock);

    const response = await getMe();

    expect(fetchMock.mock.calls[0][0]).toContain("/users/me");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("GET");
    expect(response.data.email).toBe("user@example.com");
  });

  it("calls update me endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(userResponse)));
    vi.stubGlobal("fetch", fetchMock);

    await updateMe({ displayName: "수정된 사용자", darkModeEnabled: true, language: "en" });

    expect(fetchMock.mock.calls[0][0]).toContain("/users/me");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PATCH");
    expect(fetchMock.mock.calls[0][1]?.body).toBe(
      JSON.stringify({ displayName: "수정된 사용자", darkModeEnabled: true, language: "en" })
    );
  });

  it("calls delete account endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await deleteAccount();

    expect(fetchMock.mock.calls[0][0]).toContain("/users/me");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});
