import { useI18n } from "../../../shared/i18n";
import { useCategories } from "../../categories/hooks/useCategories";
import { getCategoryDisplayName } from "../../categories/utils/categoryLabel";
import { useTodoFilterStore } from "../store/todoFilterStore";
import type { TodoStatus } from "../types";

export function TodoFilters() {
  const categories = useCategories();
  const filters = useTodoFilterStore((state) => state.filters);
  const setFilter = useTodoFilterStore((state) => state.setFilter);
  const resetFilters = useTodoFilterStore((state) => state.resetFilters);
  const { t } = useI18n();

  function handleStatusChange(value: string) {
    if (value === "") {
      setFilter("status", undefined);
      return;
    }

    setFilter("status", value as TodoStatus);
  }

  return (
    <section className="surface todo-filters" aria-label={t("todoFilter")}>
      <label>
        {t("category")}
        <select
          value={filters.categoryId ?? ""}
          onChange={(event) => setFilter("categoryId", event.target.value)}
        >
          <option value="">{t("all")}</option>
          {(categories.data?.data ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {getCategoryDisplayName(category, t)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("startDate")}
        <input
          type="date"
          value={filters.dueDateFrom ?? ""}
          onChange={(event) => setFilter("dueDateFrom", event.target.value)}
        />
      </label>
      <label>
        {t("endDate")}
        <input
          type="date"
          value={filters.dueDateTo ?? ""}
          onChange={(event) => setFilter("dueDateTo", event.target.value)}
        />
      </label>
      <label>
        {t("status")}
        <select
          value={filters.status ?? ""}
          onChange={(event) => handleStatusChange(event.target.value)}
        >
          <option value="">{t("all")}</option>
          <option value="registered">{t("statusRegistered")}</option>
          <option value="in_progress">{t("statusInProgress")}</option>
          <option value="completed">{t("statusCompleted")}</option>
          <option value="canceled">{t("statusCanceled")}</option>
        </select>
      </label>
      <button type="button" className="secondary-button" onClick={resetFilters}>
        {t("reset")}
      </button>
    </section>
  );
}
