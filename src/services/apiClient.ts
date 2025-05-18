// src/services/apiService.ts
import axios, {
  type AxiosError,
  type AxiosInstance,
  isAxiosError,
} from "axios";
import i18n from "@/locales/i18n";
import router from "@/router";
import type { UnifiedError } from "./apiServiceErrorHandler";
import { z } from "zod";
import { flattenObjectToDotNotationWithArrayAndStopAtKey } from "@/helpers/hasMethod";

export const baseUrl = import.meta.env.VITE_API_URL;

// Configure an Axios instance
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

type LaraveErrorResponse = { message?: string; errors?: any };

/**
 * Handles API errors, logs them, and re-throws them.
 * @param error The AxiosError object.
 * @param operation A string describing the operation during which the error occurred.
 * @throws UnifiedError
 */
export const handleError = (
  error: unknown | AxiosError<LaraveErrorResponse> | z.ZodError,
  operation: string = "API operation"
): never => {
  const unifiedError: Partial<UnifiedError> = {
    type: "unknown",
    originalError: error,
  };

  if (isAxiosError(error) && error.response) {
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
  } else if (error instanceof z.ZodError) {
    unifiedError.type = "validation";
    unifiedError.status = 422; // Set status to 422 for validation errors
    unifiedError.message = i18n.global.t("errors.validation_error");

    unifiedError.details = flattenObjectToDotNotationWithArrayAndStopAtKey(
      error.format()
    );
  } else {
    unifiedError.type = "unknown";
    unifiedError.message = i18n.global.t("errors.unknown_error"); // Fallback message
  }

  const isDev = import.meta.env.MODE === "development";

  if (isDev) {
    console.error(
      `Error during ${operation}: Status ${
        unifiedError.status || "N/A"
      } - Message: ${unifiedError.message}`,
      unifiedError.originalError,
      "Full Error Details:",
      unifiedError
    );
  }

  throw unifiedError; // Throw the structured error
};

/**
 * Fetches the CSRF cookie from the server.
 * Typically required by Laravel Sanctum before making state-changing requests.
 */
async function fetchCsrfToken(): Promise<void> {
  try {
    await apiClient.get<void>("/sanctum/csrf-cookie");
  } catch (error) {
    // This is a critical error for subsequent state-changing requests
    handleError(error, "fetching CSRF cookie");
  }
}

export const apiService = {
  /**
   * Performs a GET request.
   * @param url The URL to request.
   * @param params Optional query parameters.
   */
  async get<T>(url: string, params?: object): Promise<T> {
    try {
      const response = await apiClient.get<T>(url, { params });
      return response.data;
    } catch (error) {
      handleError(error, `GET ${url}`);
      throw error; // Ensure re-throw after handleError
    }
  },

  /**
   * Performs a POST request.
   * @param url The URL to post to.
   * @param data The data to send.
   * @param config Optional Axios request configuration.
   */
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      handleError(error, `POST ${url}`);
      throw error;
    }
  },

  /**
   * Performs a PUT request.
   * @param url The URL to put to.
   * @param data The data to send.
   */
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await apiClient.put<T>(url, data);
      return response.data;
    } catch (error) {
      handleError(error, `PUT ${url}`);
      throw error;
    }
  },

  /**
   * Performs a DELETE request.
   * @param url The URL to delete from.
   */
  async delete<T>(url: string): Promise<T> {
    try {
      const response = await apiClient.delete<T>(url);
      return response.data;
    } catch (error) {
      handleError(error, `DELETE ${url}`);
      throw error;
    }
  },

  /**
   * Ensures the CSRF cookie is fetched.
   * Call this before operations that require CSRF protection if not handled automatically.
   */
  getCsrfToken: fetchCsrfToken,
};
