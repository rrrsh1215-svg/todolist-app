import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSignup } from "../features/auth/hooks/useSignup";
import { isApiError } from "../shared/api/apiError";
import { ROUTES } from "../shared/constants/routes";
import { useI18n } from "../shared/i18n";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const signupMutation = useSignup();
  const navigate = useNavigate();
  const { t } = useI18n();

  function validate() {
    if (!email.trim()) return t("emailRequired");
    if (!email.includes("@")) return t("invalidEmail");
    if (password.length < 8) return t("passwordTooShort");
    if (!displayName.trim()) return t("displayNameRequired");
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
    signupMutation.mutate(
      {
        email: email.trim(),
        password,
        displayName: displayName.trim()
      },
      {
        onSuccess: () => {
          navigate(ROUTES.login, { replace: true });
        },
        onError: (error) => {
          setFormError(isApiError(error) ? error.message : t("signupFailed"));
        }
      }
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="signup-title">
        <h1 id="signup-title">{t("signup")}</h1>
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label>
            {t("displayName")}
            <input
              type="text"
              name="displayName"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
          {formError ? (
            <p className="form-error" role="alert">
              {formError}
            </p>
          ) : null}
          <button type="submit" disabled={signupMutation.isPending}>
            {signupMutation.isPending ? t("signingUp") : t("createAccount")}
          </button>
        </form>
        <p>
          {t("alreadyHaveAccount")} <Link to={ROUTES.login}>{t("login")}</Link>
        </p>
      </section>
    </main>
  );
}
