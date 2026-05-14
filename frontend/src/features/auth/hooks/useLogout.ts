import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../../../shared/constants/routes";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    }
  });
}
