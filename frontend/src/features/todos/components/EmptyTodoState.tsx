import { Link } from "react-router";
import { ROUTES } from "../../../shared/constants/routes";
import { useI18n } from "../../../shared/i18n";

export function EmptyTodoState() {
  const { t } = useI18n();

  return (
    <section className="surface empty-state">
      <p>{t("emptyTodos")}</p>
      <Link className="button-link" to={ROUTES.newTodo}>
        {t("newTodo")}
      </Link>
    </section>
  );
}
