import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import api from "@/app/lib/api";

export const useGet = <TData = any>(
  url: string,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
) => {
  return useQuery<TData>({
    queryKey: [url],
    queryFn: async () => (await api.get(url)).data,
    ...options,
  });
};

export const usePost = <TData = any, TVariables = any>(
  url: string,
  options?: UseMutationOptions<TData, unknown, TVariables>
) => {
  return useMutation<TData, unknown, TVariables>({
    mutationFn: async (data) => (await api.post(url, data)).data,
    ...options,
  });
};
