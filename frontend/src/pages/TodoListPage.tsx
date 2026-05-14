import { Link } from "react-router";
import { TodoFilters } from "../features/todos/components/TodoFilters";
import { TodoList } from "../features/todos/components/TodoList";
import { useTodos } from "../features/todos/hooks/useTodos";
import { ROUTES } from "../shared/constants/routes";
import { useI18n } from "../shared/i18n";

export function TodoListPage() {
  const todos = useTodos();
  const { t } = useI18n();

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>TodoListApp</h1>
        <nav>
          <Link to={ROUTES.profile}>{t("myInfo")}</Link>
        </nav>
      </header>
      <section className="page-header">
        <h2>{t("todoList")}</h2>
        <Link className="button-link" to={ROUTES.newTodo}>
          {t("newTodo")}
        </Link>
      </section>
      <TodoFilters />
      {todos.isLoading ? (
        <section className="surface" role="status">
          {t("loading")}
        </section>
      ) : null}
      {todos.isError ? (
        <section className="surface error-state" role="alert">
          {t("todoListLoadFailed")}
        </section>
      ) : null}
      {todos.isSuccess ? <TodoList todos={todos.data.data} /> : null}
    </main>
  );
}
