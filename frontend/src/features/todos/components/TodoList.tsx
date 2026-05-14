import { EmptyTodoState } from "./EmptyTodoState";
import { TodoItem } from "./TodoItem";
import type { Todo } from "../types";
import { useI18n } from "../../../shared/i18n";

type TodoListProps = {
  todos: Todo[];
};

export function TodoList({ todos }: TodoListProps) {
  const { t } = useI18n();

  if (todos.length === 0) {
    return <EmptyTodoState />;
  }

  return (
    <section className="todo-list" aria-label={t("todoList")}>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </section>
  );
}
