// Configure an Axios instance
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  isAxiosError,
} from "axios";
import type { UnifiedError } from "../apiServiceErrorHandler";
import i18n from "@/locales/i18n";
import router from "@/router";
import type { HttpClient } from "./genericHttpClient";

export const baseUrl = import.meta.env.VITE_API_URL;

type LaraveErrorResponse = { message?: string; errors?: any };

const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl, // Uncomment and set if you have a common base URL prefix for all API calls
  withCredentials: true, // Crucial for cookie-based authentication (e.g., Laravel Sanctum)
  withXSRFToken: true, // Crucial for CSRF protection
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

// Intercept requests to add the locale header
apiClient.interceptors.request.use((config) => {
  const locale = i18n.global.locale.value; // Get the current locale from i18n
  if (locale) {
    config.headers["Accept-Language"] = locale; // Set the Accept-Language header
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const gates = router.currentRoute.value.meta?.gates as string[] | undefined;
    if (error.response?.status === 401 && gates?.includes("auth")) {
      router.push({ name: "login-otp" });
    } else if (error.response?.status === 429) {
      router.push({ name: "429" });
    }
    return Promise.reject(error);
  }
);

export const isClientError = <T = any>(
  error: unknown
): error is AxiosError<T> => {
  return !!(isAxiosError(error) && error.response);
};

export const errorHandler = <T extends Partial<UnifiedError>>(
  error: unknown,
  unifiedError: T
): T => {
  if (isClientError<LaraveErrorResponse>(error) && error.response) {
    const { status, data } = error.response;

    unifiedError.status = status;
    unifiedError.message = data?.message || error.message;

    switch (status) {
      case 422:
        unifiedError.type = "validation";
        unifiedError.message =
          unifiedError.message ?? i18n.global.t("errors.validation_error");
        if (data?.errors && typeof data.errors === "object") {
          unifiedError.details = data.errors;
        } else {
          unifiedError.details = {};
        }
        break;

      case 401:
        unifiedError.type = "network";
        unifiedError.message = i18n.global.t("errors.unauthorized");
        break;

      case 403:
        unifiedError.type = "network";
        unifiedError.message = i18n.global.t("errors.forbidden");
        break;

      case 404:
        unifiedError.type = "network";
        unifiedError.message = i18n.global.t("errors.not_found");
        break;

      case 429:
        unifiedError.type = "network";
        unifiedError.message = i18n.global.t("errors.too_many_requests");
        break;

      case 500:
        unifiedError.type = "server";
        unifiedError.message = i18n.global.t("errors.server_error");
        break;

      default:
        // Handle other status codes not specifically listed
        if (status >= 500) {
          // Any other 5xx status code
          unifiedError.type = "server";
          // Use the generic server error message
          unifiedError.message = i18n.global.t("errors.server_error");
        } else {
          // Default for other 4xx codes (like 400, 408, etc.) or unhandled codes
          unifiedError.type = "network";
          // Use the generic network error message
          unifiedError.message = i18n.global.t("errors.network_error");
        }
        break;
    }
  }
  return unifiedError;
};

export const axiosHttpClient: HttpClient = {
  async get<T>(url: string, options?: AxiosRequestConfig) {
    const response = await apiClient.get<T>(url, options);
    return response.data;
  },
  async post<T>(url: string, data?: any, options?: AxiosRequestConfig) {
    const response = await apiClient.post<T>(url, data, options);
    return response.data;
  },
  async put<T>(url: string, data?: any, options?: AxiosRequestConfig) {
    const response = await apiClient.put<T>(url, data, options);
    return response.data;
  },
  async delete<T>(url: string, options?: AxiosRequestConfig) {
    const response = await apiClient.delete<T>(url, options);
    return response.data;
  },
};

export default axiosHttpClient;
