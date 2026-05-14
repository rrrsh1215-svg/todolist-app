import { httpClient } from "../../../shared/api/httpClient";
import type { AppLanguage } from "../../../shared/i18n";
import type { ApiResponse } from "../../../shared/types/api";
import type { User } from "../../auth/types";

export type UpdateMeRequest = {
  displayName: string;
  darkModeEnabled: boolean;
  language: AppLanguage;
};

export function getMe() {
  return httpClient.get<ApiResponse<User>>("/users/me");
}

export function updateMe(request: UpdateMeRequest) {
  return httpClient.patch<ApiResponse<User>>("/users/me", request);
}

export function deleteAccount() {
  return httpClient.delete<void>("/users/me");
}
