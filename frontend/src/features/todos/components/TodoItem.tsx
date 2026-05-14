import { useState } from "react";
import { Link } from "react-router";
import { isApiError } from "../../../shared/api/apiError";
import { useI18n } from "../../../shared/i18n";
import { getCategoryDisplayName } from "../../categories/utils/categoryLabel";
import { useDeleteTodo } from "../hooks/useDeleteTodo";
import type { Todo, TodoStatus } from "../types";

type TodoItemProps = {
  todo: Todo;
};

function formatDueDate(dueDate?: string | null) {
  return dueDate ?? "-";
}

function getStatusLabel(t: ReturnType<typeof useI18n>["t"], status: TodoStatus) {
  const labels = {
    registered: t("statusRegistered"),
    in_progress: t("statusInProgress"),
    completed: t("statusCompleted"),
    canceled: t("statusCanceled")
  };

  return labels[status];
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const deleteTodo = useDeleteTodo();
  const { t } = useI18n();
  const categoryName = todo.category ? getCategoryDisplayName(todo.category, t) : "-";
  const todoStatus = todo.status ?? (todo.isCompleted ? "completed" : "registered");
  const status = getStatusLabel(t, todoStatus);

  function handleDelete() {
    setActionError(null);
    deleteTodo.mutate(todo.id, {
      onSuccess: () => {
        setIsRemoved(true);
      },
      onError: (error) => {
        setActionError(isApiError(error) ? error.message : t("deleteTodoFailed"));
      }
    });
  }

  if (isRemoved) {
    return null;
  }

  return (
    <article className="todo-item">
      <div className="todo-content">
        <h3>{todo.title}</h3>
        {todo.description ? <p>{todo.description}</p> : null}
      </div>
      <dl className="todo-meta">
        <div>
          <dt>{t("category")}</dt>
          <dd>{categoryName}</dd>
        </div>
        <div>
          <dt>{t("endDate")}</dt>
          <dd>{formatDueDate(todo.dueDate)}</dd>
        </div>
        <div>
          <dt>{t("status")}</dt>
          <dd>{status}</dd>
        </div>
      </dl>
      <div className="todo-actions">
        <Link to={`/todos/${todo.id}/edit`}>{t("edit")}</Link>
        {isConfirmingDelete ? (
          <>
            <button type="button" className="link-button danger-link" onClick={handleDelete}>
              {t("confirmDelete")}
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => setIsConfirmingDelete(false)}
            >
              {t("cancel")}
            </button>
          </>
        ) : (
          <button type="button" className="link-button" onClick={() => setIsConfirmingDelete(true)}>
            {t("delete")}
          </button>
        )}
      </div>
      {isConfirmingDelete ? <p className="todo-confirm">{t("todoConfirmDelete")}</p> : null}
      {actionError ? (
        <p className="form-error todo-action-error" role="alert">
          {actionError}
        </p>
      ) : null}
    </article>
  );
}
