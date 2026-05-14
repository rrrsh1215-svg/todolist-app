import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../features/auth/store/authStore";
import { useTodoFilterStore } from "../features/todos/store/todoFilterStore";
import type { Todo } from "../features/todos/types";
import { AppRouter } from "./router";

const now = "2026-05-14T00:00:00.000Z";
const user = {
  id: "user-id",
  email: "user@example.com",
  displayName: "테스트 사용자",
  createdAt: now,
  updatedAt: now
};
const category = {
  id: "category-id",
  userId: null,
  name: "업무",
  isDefault: true,
  createdAt: now,
  updatedAt: now
};

function renderRoute(path: string, children: ReactNode = <AppRouter />) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

function json(data: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(data), { status }));
}

function createFetchMock() {
  let nextId = 1;
  let todos: Todo[] = [];
  const requestedUrls: string[] = [];

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl = String(input);
    requestedUrls.push(requestUrl);
    const url = new URL(requestUrl);
    const method = init?.method ?? "GET";

    if (url.pathname === "/api/auth/signup" && method === "POST") {
      return json({ data: user }, 201);
    }

    if (url.pathname === "/api/auth/login" && method === "POST") {
      return json({ data: { token: "jwt-token", user } });
    }

    if (url.pathname === "/api/categories" && method === "GET") {
      return json({ data: [category] });
    }

    if (url.pathname === "/api/todos" && method === "GET") {
      const status = url.searchParams.get("status");
      const filteredTodos = status === null ? todos : todos.filter((todo) => todo.status === status);

      return json({ data: filteredTodos });
    }

    if (url.pathname === "/api/todos" && method === "POST") {
      const body = JSON.parse(String(init?.body)) as Partial<Todo>;
      const todo: Todo = {
        id: `todo-${nextId}`,
        userId: user.id,
        categoryId: String(body.categoryId),
        category,
        title: String(body.title),
        description: body.description ?? null,
        dueDate: body.dueDate ?? null,
        status: "registered",
        isCompleted: false,
        createdAt: now,
        updatedAt: now
      };

      nextId += 1;
      todos = [todo, ...todos];
      return json({ data: todo }, 201);
    }

    const todoMatch = url.pathname.match(/^\/api\/todos\/([^/]+)$/);
    if (todoMatch) {
      const todoId = todoMatch[1];
      const todo = todos.find((item) => item.id === todoId);

      if (!todo) {
        return json({ code: "NOT_FOUND", message: "Not found" }, 404);
      }

      if (method === "GET") {
        return json({ data: todo });
      }

      if (method === "PATCH") {
        const body = JSON.parse(String(init?.body)) as Partial<Todo>;
        const updatedTodo = {
          ...todo,
          ...body,
          isCompleted: body.status ? body.status === "completed" : body.isCompleted ?? todo.isCompleted,
          category,
          updatedAt: now
        };
        todos = todos.map((item) => (item.id === todoId ? updatedTodo : item));
        return json({ data: updatedTodo });
      }

      if (method === "DELETE") {
        todos = todos.filter((item) => item.id !== todoId);
        return Promise.resolve(new Response(null, { status: 204 }));
      }
    }

    return json({ code: "NOT_FOUND", message: "Unhandled request" }, 404);
  });

  return { fetchMock, requestedUrls };
}

describe("MVP frontend flow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().clearAuth();
    useTodoFilterStore.getState().resetFilters();
  });

  it("supports signup, login, todo create, filtering, completion, editing, and deletion", async () => {
    const { fetchMock, requestedUrls } = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    renderRoute("/signup");

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: user.email }
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "password123" }
    });
    fireEvent.change(screen.getByLabelText("이름 또는 닉네임"), {
      target: { value: user.displayName }
    });
    fireEvent.click(screen.getByRole("button", { name: "계정 만들기" }));

    expect(await screen.findByRole("heading", { name: "로그인" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: user.email }
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByRole("heading", { name: "할 일 목록" })).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBe("jwt-token");

    fireEvent.click(screen.getByRole("link", { name: "새 할 일" }));

    expect(await screen.findByRole("heading", { name: "할 일 등록" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("할 일명"), {
      target: { value: "통합 흐름 확인" }
    });
    fireEvent.change(screen.getByLabelText("설명"), {
      target: { value: "MVP 통합 테스트" }
    });
    fireEvent.change(screen.getByLabelText("종료예정일"), {
      target: { value: "2026-05-15" }
    });
    fireEvent.change(screen.getByLabelText("카테고리"), {
      target: { value: category.id }
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("통합 흐름 확인")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("상태"), {
      target: { value: "registered" }
    });

    await waitFor(() => {
      expect(requestedUrls.some((url) => url.includes("/todos?status=registered"))).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: "초기화" }));

    fireEvent.click(screen.getByRole("link", { name: "편집" }));

    expect(await screen.findByRole("heading", { name: "할 일 수정" })).toBeInTheDocument();
    fireEvent.change(await screen.findByLabelText("할 일명"), {
      target: { value: "수정된 통합 흐름" }
    });
    fireEvent.change(screen.getByLabelText("상태"), {
      target: { value: "completed" }
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("수정된 통합 흐름")).toBeInTheDocument();
    expect(screen.getAllByText("완료").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제 확인" }));

    await waitFor(() => {
      expect(screen.queryByText("수정된 통합 흐름")).not.toBeInTheDocument();
    });
  });

  it("keeps the protected todo screen renderable at mobile and desktop viewport widths", async () => {
    const { fetchMock } = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);
    useAuthStore.getState().login("jwt-token", user);

    for (const width of [390, 1440]) {
      window.innerWidth = width;
      const view = renderRoute("/todos");

      expect(await screen.findByRole("heading", { name: "할 일 목록" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "새 할 일" })).toBeInTheDocument();

      view.unmount();
    }
  });
});
