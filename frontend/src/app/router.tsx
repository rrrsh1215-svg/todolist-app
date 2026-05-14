import { Navigate, Route, Routes } from "react-router";
import { AuthRedirect } from "../features/auth/components/AuthRedirect";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "../features/auth/components/PublicOnlyRoute";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";
import { SignupPage } from "../pages/SignupPage";
import { TodoFormPage } from "../pages/TodoFormPage";
import { TodoListPage } from "../pages/TodoListPage";
import { ROUTES } from "../shared/constants/routes";

export function AppRouter() {
  return (
    <Routes>
      <Route index element={<AuthRedirect />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.signup} element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.todos} element={<TodoListPage />} />
        <Route path={ROUTES.newTodo} element={<TodoFormPage />} />
        <Route path={ROUTES.editTodo} element={<TodoFormPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  );
}
