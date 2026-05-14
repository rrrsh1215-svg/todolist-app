import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { AppProviders } from "../app/providers";
import { describe, expect, it } from "vitest";
import { ProfilePage } from "./ProfilePage";
import { SignupPage } from "./SignupPage";
import { TodoFormPage } from "./TodoFormPage";
import { TodoListPage } from "./TodoListPage";

function renderPage(page: ReactElement) {
  return render(<AppProviders>{page}</AppProviders>);
}

describe("pages", () => {
  it("renders signup page", () => {
    renderPage(<SignupPage />);

    expect(screen.getByRole("heading", { name: "회원가입" })).toBeInTheDocument();
  });

  it("renders todo list page", () => {
    renderPage(<TodoListPage />);

    expect(screen.getByRole("heading", { name: "할 일 목록" })).toBeInTheDocument();
  });

  it("renders todo form page", () => {
    renderPage(<TodoFormPage />);

    expect(screen.getByRole("heading", { name: "할 일 등록" })).toBeInTheDocument();
  });

  it("renders profile page", () => {
    renderPage(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "내 정보" })).toBeInTheDocument();
  });
});
