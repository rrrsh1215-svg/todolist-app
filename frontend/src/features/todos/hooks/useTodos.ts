import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { getTodos } from "../api/todoApi";
import { useTodoFilterStore } from "../store/todoFilterStore";

export function useTodos() {
  const filters = useTodoFilterStore((state) => state.filters);

  return useQuery({
    queryKey: queryKeys.todos(filters),
    queryFn: () => getTodos(filters)
  });
}
