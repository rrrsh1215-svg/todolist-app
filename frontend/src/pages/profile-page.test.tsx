import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../features/auth/store/authStore";
import { ProfilePage } from "./ProfilePage";

const user = {
  id: "user-id",
  email: "user@example.com",
  displayName: "테스트 사용자",
  darkModeEnabled: false,
  language: "ko" as const,
  createdAt: "2026-05-14T00:00:00.000Z",
  updatedAt: "2026-05-14T00:00:00.000Z"
};

function renderProfile() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<div>로그인 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ProfilePage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().clearAuth();
  });

  it("loads and updates profile", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === "PATCH") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: { ...user, displayName: "수정된 사용자", darkModeEnabled: true, language: "en" }
            }),
            { status: 200 }
          )
        );
      }

      return Promise.resolve(new Response(JSON.stringify({ data: user }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);
    useAuthStore.getState().login("jwt-token", user);

    renderProfile();

    expect(await screen.findByDisplayValue("user@example.com")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("이름 또는 닉네임"), {
      target: { value: "수정된 사용자" }
    });
    fireEvent.change(screen.getByLabelText("언어"), {
      target: { value: "en" }
    });
    fireEvent.click(screen.getByLabelText("다크모드 사용"));
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("Saved.")).toBeInTheDocument();
    expect(fetchMock.mock.calls[1][1]?.body).toBe(
      JSON.stringify({ displayName: "수정된 사용자", darkModeEnabled: true, language: "en" })
    );
    expect(useAuthStore.getState().user?.displayName).toBe("수정된 사용자");
    expect(useAuthStore.getState().user?.darkModeEnabled).toBe(true);
    expect(useAuthStore.getState().user?.language).toBe("en");
  });

  it("validates display name", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: user }), { status: 200 }))
    );

    renderProfile();

    await screen.findByDisplayValue("테스트 사용자");
    fireEvent.change(screen.getByLabelText("이름 또는 닉네임"), {
      target: { value: "" }
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.getByText("이름 또는 닉네임을 입력하세요.")).toBeInTheDocument();
  });

  it("logs out and clears auth state", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/auth/logout") && init?.method === "POST") {
        return Promise.resolve(new Response(null, { status: 204 }));
      }

      return Promise.resolve(new Response(JSON.stringify({ data: user }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);
    useAuthStore.getState().login("jwt-token", user);

    renderProfile();

    await screen.findByDisplayValue("테스트 사용자");
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
    expect(screen.getByText("로그인 화면")).toBeInTheDocument();
  });

  it("shows delete account confirmation and deletes account", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/users/me") && init?.method === "DELETE") {
        return Promise.resolve(new Response(null, { status: 204 }));
      }

      return Promise.resolve(new Response(JSON.stringify({ data: user }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);
    useAuthStore.getState().login("jwt-token", user);

    renderProfile();

    await screen.findByDisplayValue("테스트 사용자");
    fireEvent.click(screen.getByRole("button", { name: "회원 탈퇴" }));

    expect(screen.getByText("사용자 계정")).toBeInTheDocument();
    expect(screen.getByText("본인 소유 할 일")).toBeInTheDocument();
    expect(screen.getByText("사용자 추가 카테고리")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
    expect(screen.getByText("로그인 화면")).toBeInTheDocument();
  });
});
