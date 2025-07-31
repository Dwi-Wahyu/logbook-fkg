import axios from "axios";

// Instance dasar untuk JSON data
const axiosClient = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance khusus untuk FormData (file upload)
export const axiosFormClient = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Fungsi helper untuk konversi object ke FormData
export const toFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, item);
      });
    } else if (value instanceof FileList) {
      Array.from(value).forEach((file) => {
        formData.append(key, file);
      });
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

// Interceptors untuk semua instance
const setupInterceptors = (instance: typeof axios) => {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Tambahkan token auth jika ada
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Redirect ke login jika unauthorized
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
};

// Setup interceptors untuk kedua instance
// setupInterceptors(apiClient);
// setupInterceptors(apiFormClient);

export default axiosClient;
