import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTodoFilterStore } from "../features/todos/store/todoFilterStore";
import { TodoListPage } from "./TodoListPage";

function renderPage(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("TodoListPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useTodoFilterStore.getState().resetFilters();
  });

  it("renders loading and todo list states", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("/categories")) {
          return Promise.resolve(new Response(JSON.stringify({ data: [] })));
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: "todo-id",
                  userId: "user-id",
                  categoryId: "category-id",
                  category: { name: "업무" },
                  title: "주간 보고서 작성",
                  description: "초안 작성",
                  dueDate: "2026-05-15",
                  isCompleted: false,
                  createdAt: "2026-05-14T00:00:00.000Z",
                  updatedAt: "2026-05-14T00:00:00.000Z"
                }
              ]
            })
          )
        );
      })
    );

    renderPage(<TodoListPage />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
    expect(await screen.findByText("주간 보고서 작성")).toBeInTheDocument();
  });

  it("renders empty todo state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ data: [] }))))
    );

    renderPage(<TodoListPage />);

    expect(await screen.findByText("조건에 맞는 할 일이 없습니다.")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("/categories")) {
          return Promise.resolve(new Response(JSON.stringify({ data: [] })));
        }

        return Promise.resolve(
          new Response(JSON.stringify({ code: "SERVER_ERROR", message: "Failed" }), {
            status: 500
          })
        );
      })
    );

    renderPage(<TodoListPage />);

    await waitFor(() => {
      expect(screen.getByText("할 일 목록을 불러오지 못했습니다.")).toBeInTheDocument();
    });
  });
});
