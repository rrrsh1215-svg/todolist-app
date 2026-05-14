import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { deleteTodo } from "../api/todoApi";

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: string) => deleteTodo(todoId),
    onSuccess: (_data, todoId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos() });
      void queryClient.removeQueries({ queryKey: queryKeys.todo(todoId) });
    }
  });
}
