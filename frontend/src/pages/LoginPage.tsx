import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useLogin } from "../features/auth/hooks/useLogin";
import { useAuthStore } from "../features/auth/store/authStore";
import { isApiError } from "../shared/api/apiError";
import { ROUTES } from "../shared/constants/routes";
import { useI18n } from "../shared/i18n";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const loginMutation = useLogin();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const from = (location.state as LocationState | null)?.from?.pathname ?? ROUTES.todos;

  function validate() {
    if (!email.trim()) return t("emailRequired");
    if (!password) return t("passwordRequired");
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validate();

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (response) => {
          login(response.data.token, response.data.user);
          navigate(from, { replace: true });
        },
        onError: (error) => {
          setFormError(isApiError(error) ? error.message : t("loginFailed"));
        }
      }
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <h1 id="login-title">{t("login")}</h1>
        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <label>
            {t("email")}
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            {t("password")}
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {formError ? (
            <p className="form-error" role="alert">
              {formError}
            </p>
          ) : null}
          <button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? t("loggingIn") : t("login")}
          </button>
        </form>
        <p>
          {t("noAccount")} <Link to={ROUTES.signup}>{t("signup")}</Link>
        </p>
      </section>
    </main>
  );
}
