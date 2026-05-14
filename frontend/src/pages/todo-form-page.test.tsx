import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodoFormPage } from "./TodoFormPage";

function renderForm(path = "/todos/new") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/todos/new" element={<TodoFormPage />} />
          <Route path="/todos/:todoId/edit" element={<TodoFormPage />} />
          <Route path="/todos" element={<div>목록 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function categoryResponse() {
  return {
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
  };
}

function todoResponse() {
  return {
    data: {
      id: "todo-id",
      userId: "user-id",
      categoryId: "category-id",
      title: "기존 할 일",
      description: "기존 설명",
      dueDate: "2026-05-20",
      isCompleted: true,
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z"
    }
  };
}

describe("TodoFormPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates required title and category", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(categoryResponse()), { status: 200 }))
      )
    );

    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.getByText("할 일명을 입력하세요.")).toBeInTheDocument();
  });

  it("creates todo with default incomplete state", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/categories")) {
        return Promise.resolve(new Response(JSON.stringify(categoryResponse()), { status: 200 }));
      }

      if (init?.method === "POST") {
        return Promise.resolve(new Response(JSON.stringify(todoResponse()), { status: 201 }));
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    renderForm();

    fireEvent.change(screen.getByLabelText("할 일명"), {
      target: { value: "새 할 일" }
    });
    fireEvent.change(screen.getByLabelText("설명"), {
      target: { value: "설명" }
    });
    fireEvent.change(screen.getByLabelText("종료예정일"), {
      target: { value: "2026-05-20" }
    });

    await screen.findByRole("option", { name: "업무" });
    fireEvent.change(screen.getByLabelText("카테고리"), {
      target: { value: "category-id" }
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
      expect(postCall?.[1]?.body).toBe(
        JSON.stringify({
          title: "새 할 일",
          description: "설명",
          dueDate: "2026-05-20",
          categoryId: "category-id"
        })
      );
    });
  });

  it("loads existing todo values and updates todo", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/categories")) {
        return Promise.resolve(new Response(JSON.stringify(categoryResponse()), { status: 200 }));
      }

      if (init?.method === "PATCH") {
        return Promise.resolve(new Response(JSON.stringify(todoResponse()), { status: 200 }));
      }

      if (url.includes("/todos/todo-id")) {
        return Promise.resolve(new Response(JSON.stringify(todoResponse()), { status: 200 }));
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    renderForm("/todos/todo-id/edit");

    expect(await screen.findByDisplayValue("기존 할 일")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("할 일명"), {
      target: { value: "수정된 할 일" }
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      const patchCall = fetchMock.mock.calls.find(([, init]) => init?.method === "PATCH");
      expect(patchCall?.[0]).toContain("/todos/todo-id");
      expect(patchCall?.[1]?.body).toContain("수정된 할 일");
      expect(patchCall?.[1]?.body).toContain("\"status\":\"completed\"");
    });
  });

  it("shows backend save error", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/categories")) {
        return Promise.resolve(new Response(JSON.stringify(categoryResponse()), { status: 200 }));
      }

      if (init?.method === "POST") {
        return Promise.resolve(
          new Response(JSON.stringify({ code: "VALIDATION_ERROR", message: "Invalid todo" }), {
            status: 400
          })
        );
      }

      return Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    renderForm();

    fireEvent.change(screen.getByLabelText("할 일명"), {
      target: { value: "새 할 일" }
    });
    await screen.findByRole("option", { name: "업무" });
    fireEvent.change(screen.getByLabelText("카테고리"), {
      target: { value: "category-id" }
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("Invalid todo")).toBeInTheDocument();
  });
});
