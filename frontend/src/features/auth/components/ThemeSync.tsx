import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export function ThemeSync() {
  const darkModeEnabled = useAuthStore((state) => state.user?.darkModeEnabled ?? false);
  const language = useAuthStore((state) => state.user?.language ?? "ko");

  useEffect(() => {
    document.documentElement.dataset.theme = darkModeEnabled ? "dark" : "light";
    document.documentElement.lang = language;
  }, [darkModeEnabled, language]);

  return null;
}
