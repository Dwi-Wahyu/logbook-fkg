import axiosClient from "@/lib/axiosClient";
import { useState, useEffect, useCallback } from "react";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface ApiRequestOptions<D = any> {
  method?: HttpMethod;
  data?: D;
  params?: any;
  headers?: any;
  autoFetch?: boolean;
}

interface ApiResponse<T, D = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (executeOptions?: Partial<ApiRequestOptions<D>>) => Promise<void>;
}

function useAxios<T, D = any>(
  url: string,
  options: ApiRequestOptions<D> = { method: "get", autoFetch: true }
): ApiResponse<T, D> {
  const { method = "get", data, params, headers, autoFetch = true } = options;

  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: autoFetch && method === "get",
    error: null,
  });

  const execute = useCallback(
    async (executeOptions: Partial<ApiRequestOptions<D>> = {}) => {
      const mergedOptions = {
        method,
        data: executeOptions.data ?? data,
        params: executeOptions.params ?? params,
        headers: executeOptions.headers ?? headers,
      };

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await axiosClient.request<T>({
          url,
          ...mergedOptions,
        });
        setState({ data: response.data, loading: false, error: null });
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error });
        throw error;
      }
    },
    [url, method, data, params, headers]
  );

  useEffect(() => {
    if (autoFetch && method === "get") {
      execute();
    }
  }, [execute, autoFetch, method]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
  };
}

// Helper hooks untuk method spesifik
export function useGet<T>(url: string, params?: any, autoFetch = true) {
  return useAxios<T>(url, { method: "get", params, autoFetch });
}

export function usePost<T, D = any>(url: string, autoFetch = false) {
  return useAxios<T, D>(url, { method: "post", autoFetch });
}

export function usePut<T, D = any>(url: string, autoFetch = false) {
  return useAxios<T, D>(url, { method: "put", autoFetch });
}

export function usePatch<T, D = any>(url: string, autoFetch = false) {
  return useAxios<T, D>(url, { method: "patch", autoFetch });
}

export function useDelete<T>(url: string, autoFetch = false) {
  return useAxios<T>(url, { method: "delete", autoFetch });
}
