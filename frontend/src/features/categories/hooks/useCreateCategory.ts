import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { createCategory, type CreateCategoryRequest } from "../api/categoryApi";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCategoryRequest) => createCategory(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    }
  });
}
