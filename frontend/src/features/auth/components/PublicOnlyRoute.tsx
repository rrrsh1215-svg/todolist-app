import { Navigate, Outlet } from "react-router";
import { ROUTES } from "../../../shared/constants/routes";
import { useAuthStore } from "../store/authStore";

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.todos} replace />;
  }

  return <Outlet />;
}
