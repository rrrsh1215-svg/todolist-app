import { type FormEvent, useState } from "react";
import { isApiError } from "../../../shared/api/apiError";
import { useI18n } from "../../../shared/i18n";
import { useCreateCategory } from "../hooks/useCreateCategory";

export function CategoryCreateForm() {
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const createCategory = useCreateCategory();
  const { t } = useI18n();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError(t("categoryNameRequired"));
      return;
    }

    setFormError(null);
    createCategory.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          setName("");
        },
        onError: (error) => {
          setFormError(isApiError(error) ? error.message : t("categoryCreateFailed"));
        }
      }
    );
  }

  return (
    <form className="category-create-form" onSubmit={handleSubmit} noValidate>
      <label>
        {t("newCategoryName")}
        <input
          type="text"
          name="categoryName"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      {formError ? (
        <p className="form-error" role="alert">
          {formError}
        </p>
      ) : null}
      <button type="submit" disabled={createCategory.isPending}>
        {createCategory.isPending ? t("adding") : t("add")}
      </button>
    </form>
  );
}
