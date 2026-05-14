import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../features/auth/store/authStore";
import type { User } from "../features/auth/types";
import { AppRouter } from "./router";

const user: User = {
  id: "user-id",
  email: "user@example.com",
  displayName: "테스트 사용자",
  createdAt: "2026-05-14T00:00:00.000Z",
  updatedAt: "2026-05-14T00:00:00.000Z"
};

function renderRoute(path: string) {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AppRouter auth routing", () => {
  afterEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("redirects unauthenticated users from protected routes to login", () => {
    renderRoute("/todos");

    expect(screen.getByRole("heading", { name: "로그인" })).toBeInTheDocument();
  });

  it("redirects authenticated users away from login to todo list", () => {
    useAuthStore.getState().login("jwt-token", user);

    renderRoute("/login");

    expect(screen.getByRole("heading", { name: "할 일 목록" })).toBeInTheDocument();
  });

  it("routes the root path based on auth state", () => {
    useAuthStore.getState().login("jwt-token", user);

    renderRoute("/");

    expect(screen.getByRole("heading", { name: "할 일 목록" })).toBeInTheDocument();
  });
});
