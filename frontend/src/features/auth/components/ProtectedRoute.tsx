import { Navigate, Outlet, useLocation } from "react-router";
import { ROUTES } from "../../../shared/constants/routes";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
