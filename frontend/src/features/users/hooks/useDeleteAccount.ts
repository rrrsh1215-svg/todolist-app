import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../auth/store/authStore";
import { ROUTES } from "../../../shared/constants/routes";
import { deleteAccount } from "../api/userApi";

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.login, { replace: true });
    }
  });
}
