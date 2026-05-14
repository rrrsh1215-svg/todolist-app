import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CategoryCreateForm } from "../features/categories/components/CategoryCreateForm";
import { CategorySelect } from "../features/categories/components/CategorySelect";
import { useCategories } from "../features/categories/hooks/useCategories";
import { useCreateTodo } from "../features/todos/hooks/useCreateTodo";
import { useTodo } from "../features/todos/hooks/useTodo";
import { useUpdateTodo } from "../features/todos/hooks/useUpdateTodo";
import type { TodoStatus } from "../features/todos/types";
import { isApiError } from "../shared/api/apiError";
import { ROUTES } from "../shared/constants/routes";
import { useI18n } from "../shared/i18n";

export function TodoFormPage() {
  const { todoId } = useParams();
  const isEditMode = Boolean(todoId);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<TodoStatus>("registered");
  const [formError, setFormError] = useState<string | null>(null);
  const categories = useCategories();
  const categoryList = categories.data?.data ?? [];
  const todo = useTodo(todoId);
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const isSaving = createTodo.isPending || updateTodo.isPending;
  const { t } = useI18n();

  useEffect(() => {
    if (!todo.data?.data) return;

    setTitle(todo.data.data.title);
    setDescription(todo.data.data.description ?? "");
    setDueDate(todo.data.data.dueDate ?? "");
    setCategoryId(todo.data.data.categoryId);
    setStatus(todo.data.data.status ?? (todo.data.data.isCompleted ? "completed" : "registered"));
  }, [todo.data]);

  function validate() {
    if (!title.trim()) return t("todoTitleRequired");
    if (!categoryId) return t("categoryRequired");
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    const request = {
      title: title.trim(),
      description: description.trim() || null,
      dueDate: dueDate || null,
      categoryId
    };

    if (isEditMode && todoId) {
      updateTodo.mutate(
        {
          todoId,
          request: {
            ...request,
            status
          }
        },
        {
          onSuccess: () => navigate(ROUTES.todos),
          onError: (error) => {
            setFormError(isApiError(error) ? error.message : t("todoSaveFailed"));
          }
        }
      );
      return;
    }

    createTodo.mutate(request, {
      onSuccess: () => navigate(ROUTES.todos),
      onError: (error) => {
        setFormError(isApiError(error) ? error.message : t("todoSaveFailed"));
      }
    });
  }

  return (
    <main className="app-shell">
      <section className="page-header">
        <h1>{isEditMode ? t("todoEdit") : t("todoRegister")}</h1>
        <Link to={ROUTES.todos}>{t("backToList")}</Link>
      </section>
      {todo.isLoading ? (
        <section className="surface" role="status">
          {t("loading")}
        </section>
      ) : null}
      {todo.isError ? (
        <section className="surface error-state" role="alert">
          {t("todoLoadFailed")}
        </section>
      ) : null}
      <form className="surface form-stack" onSubmit={handleSubmit} noValidate>
        <label>
          {t("todoTitle")}
          <input
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          {t("todoDescription")}
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          {t("dueDate")}
          <input
            type="date"
            name="dueDate"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </label>
        <CategorySelect
          categories={categoryList}
          disabled={categories.isLoading}
          error={categories.isError ? t("categoryLoadFailed") : undefined}
          value={categoryId}
          onChange={setCategoryId}
        />
        {isEditMode ? (
          <label>
            {t("status")}
            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TodoStatus)}
            >
              <option value="registered">{t("statusRegistered")}</option>
              <option value="in_progress">{t("statusInProgress")}</option>
              <option value="completed">{t("statusCompleted")}</option>
              <option value="canceled">{t("statusCanceled")}</option>
            </select>
          </label>
        ) : null}
        {formError ? (
          <p className="form-error" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="form-actions">
          <Link className="secondary-link" to={ROUTES.todos}>
            {t("cancel")}
          </Link>
          <button type="submit" disabled={isSaving}>
            {isSaving ? t("saving") : t("save")}
          </button>
        </div>
      </form>
      <section className="surface category-section" aria-labelledby="category-create-title">
        <h2 id="category-create-title">{t("addCategory")}</h2>
        <CategoryCreateForm />
      </section>
    </main>
  );
}
