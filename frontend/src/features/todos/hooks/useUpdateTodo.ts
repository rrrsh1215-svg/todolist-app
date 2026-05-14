import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { updateTodo, type UpdateTodoRequest } from "../api/todoApi";

type UpdateTodoVariables = {
  todoId: string;
  request: UpdateTodoRequest;
};

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, request }: UpdateTodoVariables) => updateTodo(todoId, request),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.todo(variables.todoId) });
    }
  });
}
