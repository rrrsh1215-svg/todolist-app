import { httpClient } from "../../../shared/api/httpClient";
import type { ApiResponse } from "../../../shared/types/api";
import type { User } from "../types";

export type SignupRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export function signup(request: SignupRequest) {
  return httpClient.post<ApiResponse<User>>("/auth/signup", request);
}

export function login(request: LoginRequest) {
  return httpClient.post<ApiResponse<LoginResponse>>("/auth/login", request);
}

export function logout() {
  return httpClient.post<void>("/auth/logout");
}
