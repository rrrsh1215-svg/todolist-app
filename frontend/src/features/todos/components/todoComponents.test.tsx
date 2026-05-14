import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTodoFilterStore } from "../store/todoFilterStore";
import type { Todo } from "../types";
import { TodoFilters } from "./TodoFilters";
import { TodoItem } from "./TodoItem";
import { TodoList } from "./TodoList";

const todo: Todo = {
  id: "todo-id",
  userId: "user-id",
  categoryId: "category-id",
  category: {
    id: "category-id",
    userId: null,
    name: "업무",
    isDefault: true,
    createdAt: "2026-05-14T00:00:00.000Z",
    updatedAt: "2026-05-14T00:00:00.000Z"
  },
  title: "주간 보고서 작성",
  description: "금요일 회의 전까지 초안 작성",
  dueDate: "2026-05-15",
  status: "registered",
  isCompleted: false,
  createdAt: "2026-05-14T00:00:00.000Z",
  updatedAt: "2026-05-14T00:00:00.000Z"
};

function renderWithProviders(children: ReactNode) {
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

describe("todo components", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useTodoFilterStore.getState().resetFilters();
  });

  it("renders todo item information without list checkbox", () => {
    renderWithProviders(<TodoItem todo={todo} />);

    expect(screen.getByText("주간 보고서 작성")).toBeInTheDocument();
    expect(screen.getByText("업무")).toBeInTheDocument();
    expect(screen.getByText("2026-05-15")).toBeInTheDocument();
    expect(screen.getByText("등록")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "편집" })).toHaveAttribute(
      "href",
      "/todos/todo-id/edit"
    );
  });

  it("renders long todo title and category name", () => {
    const longText =
      "매우긴할일제목매우긴할일제목매우긴할일제목매우긴할일제목매우긴할일제목";
    const longCategory = "매우긴카테고리명매우긴카테고리명매우긴카테고리명";

    renderWithProviders(
      <TodoItem
        todo={{
          ...todo,
          title: longText,
          category: {
            ...todo.category!,
            name: longCategory
          }
        }}
      />
    );

    expect(screen.getByText(longText)).toBeInTheDocument();
    expect(screen.getByText(longCategory)).toBeInTheDocument();
  });

  it("confirms and deletes todo item", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<TodoItem todo={todo} />);

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.getByText("이 할 일을 삭제할까요?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "삭제 확인" }));

    await waitFor(() => {
      expect(screen.queryByText("주간 보고서 작성")).not.toBeInTheDocument();
    });
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });

  it("shows delete action error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "SERVER_ERROR", message: "Action failed" }), {
          status: 500
        })
      )
    );

    renderWithProviders(<TodoItem todo={todo} />);

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제 확인" }));

    expect(await screen.findByText("Action failed")).toBeInTheDocument();
  });

  it("renders empty state when todo list has no items", () => {
    renderWithProviders(<TodoList todos={[]} />);

    expect(screen.getByText("조건에 맞는 할 일이 없습니다.")).toBeInTheDocument();
  });

  it("updates filter store from filter controls", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "category-id",
                userId: null,
                name: "업무",
                isDefault: true,
                createdAt: "2026-05-14T00:00:00.000Z",
                updatedAt: "2026-05-14T00:00:00.000Z"
              }
            ]
          })
        )
      )
    );

    renderWithProviders(<TodoFilters />);

    fireEvent.change(screen.getByLabelText("시작일"), {
      target: { value: "2026-05-01" }
    });
    fireEvent.change(screen.getByLabelText("종료일"), {
      target: { value: "2026-05-31" }
    });
    fireEvent.change(screen.getByLabelText("상태"), {
      target: { value: "in_progress" }
    });

    expect(useTodoFilterStore.getState().filters).toMatchObject({
      dueDateFrom: "2026-05-01",
      dueDateTo: "2026-05-31",
      status: "in_progress"
    });

    fireEvent.click(screen.getByRole("button", { name: "초기화" }));

    expect(useTodoFilterStore.getState().filters).toEqual({});
  });
});
