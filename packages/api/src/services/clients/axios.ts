// Configure an Axios instance
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  isAxiosError,
} from "axios";

import type { HttpClient } from "./genericHttpClient.js";
import { UnifiedError } from "../apiServiceErrorHandler.js";
import { getBaseUrl } from "../apiClient.js";

interface LaraveErrorResponse { message?: string; errors?: Record<string, string[]>; }

const apiClient: AxiosInstance = axios.create({
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
  const locale = null; // @todo this part
  const baseUrl = getBaseUrl();
  if (baseUrl) {
    config.baseURL = baseUrl; // Set the base URL for the request
  }
  if (locale) {
    config.headers["Accept-Language"] = locale; // Set the Accept-Language header
  }
  return config;
});

export const isClientError = <T = unknown>(
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
          unifiedError.message ?? "errors.validation_error";
        if (data?.errors && typeof data.errors === "object") {
          unifiedError.details = data.errors;
        } else {
          unifiedError.details = {};
        }
        break;

      case 401:
        unifiedError.type = "network";
        unifiedError.message = "errors.unauthorized";
        break;

      case 403:
        unifiedError.type = "network";
        unifiedError.message = "errors.forbidden";
        break;

      case 404:
        unifiedError.type = "network";
        unifiedError.message = "errors.not_found";
        break;

      case 429:
        unifiedError.type = "network";
        unifiedError.message = "errors.too_many_requests";
        break;

      case 500:
        unifiedError.type = "server";
        unifiedError.message = "errors.server_error";
        break;

      default:
        // Handle other status codes not specifically listed
        if (status >= 500) {
          // Any other 5xx status code
          unifiedError.type = "server";
          // Use the generic server error message
          unifiedError.message = "errors.server_error";
        } else {
          // Default for other 4xx codes (like 400, 408, etc.) or unhandled codes
          unifiedError.type = "network";
          // Use the generic network error message
          unifiedError.message = "errors.network_error";
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
  async post<T>(url: string, data?: unknown, options?: AxiosRequestConfig) {
    const response = await apiClient.post<T>(url, data, options);
    return response.data;
  },
  async put<T>(url: string, data?: unknown, options?: AxiosRequestConfig) {
    const response = await apiClient.put<T>(url, data, options);
    return response.data;
  },
  async delete<T>(url: string, options?: AxiosRequestConfig) {
    const response = await apiClient.delete<T>(url, options);
    return response.data;
  },
};

export default axiosHttpClient;
