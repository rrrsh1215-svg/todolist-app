import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { getMe } from "../api/userApi";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe
  });
}
