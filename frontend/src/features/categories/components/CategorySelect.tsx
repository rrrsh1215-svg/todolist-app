import { useI18n } from "../../../shared/i18n";
import type { Category } from "../types";
import { getCategoryDisplayName } from "../utils/categoryLabel";

type CategorySelectProps = {
  categories: Category[];
  disabled?: boolean;
  error?: string;
  name?: string;
  onChange: (categoryId: string) => void;
  value: string;
};

export function CategorySelect({
  categories,
  disabled = false,
  error,
  name = "categoryId",
  onChange,
  value
}: CategorySelectProps) {
  const { t } = useI18n();

  return (
    <label>
      {t("category")}
      <select
        aria-invalid={Boolean(error)}
        disabled={disabled}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{t("categorySelect")}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {getCategoryDisplayName(category, t)}
            {category.isDefault ? "" : " *"}
          </option>
        ))}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
