import { AppRouter } from "./router";
import { ThemeSync } from "../features/auth/components/ThemeSync";

export function App() {
  return (
    <>
      <ThemeSync />
      <AppRouter />
    </>
  );
}
