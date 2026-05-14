import { useMutation } from "@tanstack/react-query";
import { signup, type SignupRequest } from "../api/authApi";

export function useSignup() {
  return useMutation({
    mutationFn: (request: SignupRequest) => signup(request)
  });
}
