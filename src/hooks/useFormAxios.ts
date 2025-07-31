import { axiosFormClient, toFormData } from "@/lib/axiosClient";
import { AxiosProgressEvent } from "axios";
import { useState, useCallback } from "react";

interface FormApiOptions {
  onProgress?: (progress: number) => void;
  headers?: Record<string, string>;
}

interface FormApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  progress: number;
  postForm: <D extends Record<string, any>>(
    data: D,
    options?: FormApiOptions
  ) => Promise<T>;
  patchForm: <D extends Record<string, any>>(
    data: D,
    options?: FormApiOptions
  ) => Promise<T>;
  reset: () => void;
}

export function useFormAxios<T = any>(url: string): FormApiResponse<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
    progress: number;
  }>({
    data: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const makeRequest = useCallback(
    async (
      method: "post" | "patch",
      data: Record<string, any>,
      options: FormApiOptions = {}
    ): Promise<T> => {
      setState({
        data: null,
        loading: true,
        error: null,
        progress: 0,
      });

      try {
        const formData = toFormData(data);

        const config = {
          headers: options.headers,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percent = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setState((prev) => ({ ...prev, progress: percent }));
            options.onProgress?.(percent);
          },
        };

        const response = await axiosFormClient[method]<T>(
          url,
          formData,
          config
        );
        setState({
          data: response.data,
          loading: false,
          error: null,
          progress: 100,
        });

        return response.data;
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error as Error,
          progress: 0,
        });
        throw error;
      }
    },
    [url]
  );

  const postForm = useCallback(
    <D extends Record<string, any>>(data: D, options?: FormApiOptions) =>
      makeRequest("post", data, options),
    [makeRequest]
  );

  const patchForm = useCallback(
    <D extends Record<string, any>>(data: D, options?: FormApiOptions) =>
      makeRequest("patch", data, options),
    [makeRequest]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    postForm,
    patchForm,
    reset,
  };
}
