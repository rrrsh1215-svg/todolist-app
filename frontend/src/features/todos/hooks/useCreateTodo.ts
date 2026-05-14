import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { createTodo, type CreateTodoRequest } from "../api/todoApi";

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTodoRequest) => createTodo(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos() });
    }
  });
}
