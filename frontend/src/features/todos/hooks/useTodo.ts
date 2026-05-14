import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { getTodo } from "../api/todoApi";

export function useTodo(todoId?: string) {
  return useQuery({
    queryKey: queryKeys.todo(todoId ?? ""),
    queryFn: () => getTodo(todoId ?? ""),
    enabled: Boolean(todoId)
  });
}
