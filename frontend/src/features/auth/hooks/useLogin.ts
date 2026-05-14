import { useMutation } from "@tanstack/react-query";
import { login, type LoginRequest } from "../api/authApi";

export function useLogin() {
  return useMutation({
    mutationFn: (request: LoginRequest) => login(request)
  });
}
