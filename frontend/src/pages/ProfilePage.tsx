import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router";
import { useLogout } from "../features/auth/hooks/useLogout";
import { useDeleteAccount } from "../features/users/hooks/useDeleteAccount";
import { useMe } from "../features/users/hooks/useMe";
import { useUpdateMe } from "../features/users/hooks/useUpdateMe";
import { isApiError } from "../shared/api/apiError";
import { ROUTES } from "../shared/constants/routes";
import type { AppLanguage } from "../shared/i18n";
import { useI18n } from "../shared/i18n";

export function ProfilePage() {
  const me = useMe();
  const updateMe = useUpdateMe();
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const [displayName, setDisplayName] = useState("");
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>("ko");
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (me.data?.data) {
      setDisplayName(me.data.data.displayName);
      setDarkModeEnabled(Boolean(me.data.data.darkModeEnabled));
      setLanguage(me.data.data.language ?? "ko");
    }
  }, [me.data]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextDisplayName = displayName.trim();

    if (!nextDisplayName) {
      setFormError(t("displayNameRequired"));
      return;
    }

    setFormError(null);
    updateMe.mutate(
      { displayName: nextDisplayName, darkModeEnabled, language },
      {
        onError: (error) => {
          setFormError(isApiError(error) ? error.message : t("profileSaveFailed"));
        }
      }
    );
  }

  function handleDeleteAccount() {
    setFormError(null);
    deleteAccount.mutate(undefined, {
      onError: (error) => {
        setFormError(isApiError(error) ? error.message : t("deleteAccount"));
      }
    });
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <h1>{t("myInfo")}</h1>
        <Link to={ROUTES.todos}>{t("todoList")}</Link>
      </section>
      {me.isLoading ? (
        <section className="surface" role="status">
          {t("loading")}
        </section>
      ) : null}
      {me.isError ? (
        <section className="surface error-state" role="alert">
          {t("profileLoadFailed")}
        </section>
      ) : null}
      <form className="surface form-stack" onSubmit={handleSubmit} noValidate>
        <label>
          {t("email")}
          <input type="email" name="email" value={me.data?.data.email ?? ""} readOnly />
        </label>
        <label>
          {t("displayName")}
          <input
            type="text"
            name="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        <label>
          {t("language")}
          <select
            name="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as AppLanguage)}
          >
            <option value="ko">{t("languageKo")}</option>
            <option value="en">{t("languageEn")}</option>
            <option value="ja">{t("languageJa")}</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="darkModeEnabled"
            checked={darkModeEnabled}
            onChange={(event) => setDarkModeEnabled(event.target.checked)}
          />
          {t("darkMode")}
        </label>
        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : null}
        {updateMe.isSuccess ? (
          <p className="form-success" role="status">
            {t("saved")}
          </p>
        ) : null}
        <div className="form-actions">
          <Link className="secondary-link" to={ROUTES.todos}>
            {t("cancel")}
          </Link>
          <button type="submit" disabled={updateMe.isPending}>
            {updateMe.isPending ? t("saving") : t("save")}
          </button>
        </div>
      </form>
      <section className="surface account-section" aria-labelledby="account-title">
        <h2 id="account-title">{t("deleteAccount")}</h2>
        <div className="account-actions">
          <button type="button" className="secondary-button" onClick={() => logout.mutate()}>
            {t("logout")}
          </button>
          <button
            type="button"
            className="secondary-button danger-button"
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            {t("deleteAccount")}
          </button>
        </div>
        {isDeleteConfirmOpen ? (
          <div className="delete-confirm" role="alert">
            <p>{t("deleteAccountText")}</p>
            <ul>
              <li>{t("deleteAccountUser")}</li>
              <li>{t("deleteAccountTodos")}</li>
              <li>{t("deleteAccountCategories")}</li>
            </ul>
            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="danger-button"
                disabled={deleteAccount.isPending}
                onClick={handleDeleteAccount}
              >
                {deleteAccount.isPending ? t("deleteAccountPending") : t("deleteAccountConfirm")}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
