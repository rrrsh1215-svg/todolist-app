import { afterEach, describe, expect, it, vi } from "vitest";
import { createCategory, getCategories } from "./categoryApi";

describe("categoryApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls categories list endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "category-id",
              userId: null,
              name: "일반",
              isDefault: true,
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z"
            }
          ]
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await getCategories();

    expect(fetchMock.mock.calls[0][0]).toContain("/categories");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("GET");
    expect(response.data[0].name).toBe("일반");
  });

  it("calls category create endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "category-id",
            userId: "user-id",
            name: "프로젝트",
            isDefault: false,
            createdAt: "2026-05-14T00:00:00.000Z",
            updatedAt: "2026-05-14T00:00:00.000Z"
          }
        }),
        { status: 201 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await createCategory({ name: "프로젝트" });

    expect(fetchMock.mock.calls[0][0]).toContain("/categories");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ name: "프로젝트" }));
  });
});
