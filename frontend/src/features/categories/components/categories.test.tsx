import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryCreateForm } from "./CategoryCreateForm";
import { CategorySelect } from "./CategorySelect";

function renderWithQueryClient(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

describe("category components", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders default and user categories in select", () => {
    const onChange = vi.fn();

    render(
      <CategorySelect
        categories={[
          {
            id: "default-id",
            userId: null,
            name: "일반",
            isDefault: true,
            createdAt: "2026-05-14T00:00:00.000Z",
            updatedAt: "2026-05-14T00:00:00.000Z"
          },
          {
            id: "custom-id",
            userId: "user-id",
            name: "프로젝트",
            isDefault: false,
            createdAt: "2026-05-14T00:00:00.000Z",
            updatedAt: "2026-05-14T00:00:00.000Z"
          }
        ]}
        value=""
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText("카테고리"), {
      target: { value: "custom-id" }
    });

    expect(screen.getByRole("option", { name: "일반" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "프로젝트 *" })).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("custom-id");
  });

  it("validates empty category name", () => {
    renderWithQueryClient(<CategoryCreateForm />);

    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(screen.getByText("카테고리명을 입력하세요.")).toBeInTheDocument();
  });

  it("creates category and clears input", async () => {
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

    renderWithQueryClient(<CategoryCreateForm />);

    const input = screen.getByLabelText("새 카테고리명");
    fireEvent.change(input, { target: { value: "프로젝트" } });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    expect(input).toHaveValue("");
  });

  it("shows backend create error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "CONFLICT", message: "Category already exists" }), {
          status: 409
        })
      )
    );

    renderWithQueryClient(<CategoryCreateForm />);

    fireEvent.change(screen.getByLabelText("새 카테고리명"), {
      target: { value: "프로젝트" }
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByText("Category already exists")).toBeInTheDocument();
  });
});
