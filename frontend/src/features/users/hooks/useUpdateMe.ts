import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useAuthStore } from "../../auth/store/authStore";
import { updateMe, type UpdateMeRequest } from "../api/userApi";

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (request: UpdateMeRequest) => updateMe(request),
    onSuccess: (response) => {
      const token = useAuthStore.getState().token;

      if (token) {
        setAuth(token, response.data);
      }

      queryClient.setQueryData(queryKeys.me, response);
    }
  });
}
