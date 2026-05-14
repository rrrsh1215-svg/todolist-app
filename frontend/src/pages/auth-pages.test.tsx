import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "../app/providers";
import { useAuthStore } from "../features/auth/store/authStore";
import { LoginPage } from "./LoginPage";
import { SignupPage } from "./SignupPage";

describe("auth pages", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().clearAuth();
  });

  it("validates required login fields", () => {
    render(
      <AppProviders>
        <LoginPage />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(screen.getByText("이메일을 입력하세요.")).toBeInTheDocument();
  });

  it("stores login token in memory after successful login", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              token: "jwt-token",
              user: {
                id: "user-id",
                email: "user@example.com",
                displayName: "테스트 사용자",
                createdAt: "2026-05-14T00:00:00.000Z",
                updatedAt: "2026-05-14T00:00:00.000Z"
              }
            }
          }),
          { status: 200 }
        )
      )
    );

    render(
      <AppProviders>
        <LoginPage />
      </AppProviders>
    );

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "user@example.com" }
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "password123!" }
    });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe("jwt-token");
    });
    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("validates signup fields", () => {
    render(
      <AppProviders>
        <SignupPage />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "계정 만들기" }));

    expect(screen.getByText("이메일을 입력하세요.")).toBeInTheDocument();
  });

  it("shows backend signup error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "CONFLICT", message: "Email already exists" }), {
          status: 409
        })
      )
    );

    render(
      <AppProviders>
        <SignupPage />
      </AppProviders>
    );

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "user@example.com" }
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "password123!" }
    });
    fireEvent.change(screen.getByLabelText("이름 또는 닉네임"), {
      target: { value: "테스트 사용자" }
    });
    fireEvent.click(screen.getByRole("button", { name: "계정 만들기" }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });
});
