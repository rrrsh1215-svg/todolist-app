import { afterEach, describe, expect, it, vi } from "vitest";
import { createTodo, deleteTodo, getTodo, getTodos, updateTodo } from "./todoApi";

const todoResponse = {
  data: {
    id: "todo-id",
    userId: "user-id",
    categoryId: "category-id",
    title: "할 일",
    description: null,
    dueDate: "2026-05-20",
    isCompleted: false,
    createdAt: "2026-05-14T00:00:00.000Z",
    updatedAt: "2026-05-14T00:00:00.000Z"
  }
};

describe("todoApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls todos list endpoint with filters as query parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [todoResponse.data] }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await getTodos({
      categoryId: "category-id",
      dueDateFrom: "2026-05-01",
      dueDateTo: "2026-05-31",
      isCompleted: false
    });

    const url = String(fetchMock.mock.calls[0][0]);

    expect(url).toContain("/todos?");
    expect(url).toContain("categoryId=category-id");
    expect(url).toContain("dueDateFrom=2026-05-01");
    expect(url).toContain("dueDateTo=2026-05-31");
    expect(url).toContain("isCompleted=false");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("GET");
  });

  it("calls create todo endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(todoResponse), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await createTodo({
      title: "할 일",
      categoryId: "category-id",
      dueDate: "2026-05-20"
    });

    expect(fetchMock.mock.calls[0][0]).toContain("/todos");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });

  it("calls todo detail endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(todoResponse), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await getTodo("todo-id");

    expect(fetchMock.mock.calls[0][0]).toContain("/todos/todo-id");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("GET");
    expect(response.data.id).toBe("todo-id");
  });

  it("calls update todo endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(todoResponse), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateTodo("todo-id", { title: "수정", isCompleted: true });

    expect(fetchMock.mock.calls[0][0]).toContain("/todos/todo-id");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PATCH");
    expect(fetchMock.mock.calls[0][1]?.body).toBe(
      JSON.stringify({ title: "수정", isCompleted: true })
    );
  });

  it("calls delete todo endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await deleteTodo("todo-id");

    expect(fetchMock.mock.calls[0][0]).toContain("/todos/todo-id");
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});
