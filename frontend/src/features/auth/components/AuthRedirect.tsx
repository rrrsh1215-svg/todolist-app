import { Navigate } from "react-router";
import { ROUTES } from "../../../shared/constants/routes";
import { useAuthStore } from "../store/authStore";

export function AuthRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <Navigate to={isAuthenticated ? ROUTES.todos : ROUTES.login} replace />;
}
