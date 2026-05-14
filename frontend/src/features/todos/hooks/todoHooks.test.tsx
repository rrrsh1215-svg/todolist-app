import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCreateTodo } from "./useCreateTodo";
import { useDeleteTodo } from "./useDeleteTodo";
import { useTodos } from "./useTodos";
import { useUpdateTodo } from "./useUpdateTodo";
import { useTodoFilterStore } from "../store/todoFilterStore";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("todo hooks", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useTodoFilterStore.getState().resetFilters();
  });

  it("uses filter store values for todo list query", async () => {
    useTodoFilterStore.getState().setFilter("status", "completed");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] })));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain("status=completed");
  });

  it("creates todo with mutation hook", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "todo-id",
            userId: "user-id",
            categoryId: "category-id",
            title: "할 일",
            isCompleted: false,
            createdAt: "2026-05-14T00:00:00.000Z",
            updatedAt: "2026-05-14T00:00:00.000Z"
          }
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCreateTodo(), { wrapper });
    await result.current.mutateAsync({ title: "할 일", categoryId: "category-id" });

    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
  });

  it("updates todo status with mutation hook", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "todo-id",
            userId: "user-id",
            categoryId: "category-id",
            title: "할 일",
            status: "completed",
            isCompleted: true,
            createdAt: "2026-05-14T00:00:00.000Z",
            updatedAt: "2026-05-14T00:00:00.000Z"
          }
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useUpdateTodo(), { wrapper });
    await result.current.mutateAsync({ todoId: "todo-id", request: { status: "completed" } });

    expect(fetchMock.mock.calls[0][1]?.method).toBe("PATCH");
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ status: "completed" }));
  });

  it("deletes todo with mutation hook", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useDeleteTodo(), { wrapper });
    await result.current.mutateAsync("todo-id");

    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});
