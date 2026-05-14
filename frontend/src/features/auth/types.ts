import type { AppLanguage } from "../../shared/i18n";

export type User = {
  id: string;
  email: string;
  displayName: string;
  darkModeEnabled?: boolean;
  language?: AppLanguage;
  createdAt: string;
  updatedAt: string;
};
