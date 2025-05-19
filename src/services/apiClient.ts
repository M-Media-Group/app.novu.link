// src/services/apiService.ts
import i18n from "@/locales/i18n";

import type { UnifiedError } from "./apiServiceErrorHandler";
import { z } from "zod";
import { flattenObjectToDotNotationWithArrayAndStopAtKey } from "@/helpers/hasMethod";
import apiClient, { errorHandler, isClientError } from "./clients/axios";

export const baseUrl = import.meta.env.VITE_API_URL;

/**
 * Handles API errors, logs them, and re-throws them.
 * @param error The AxiosError object.
 * @param operation A string describing the operation during which the error occurred.
 * @throws UnifiedError
 */
export const handleError = (
  error: unknown,
  operation: string = "API operation"
): never => {
  let unifiedError: Partial<UnifiedError> = {
    type: "unknown",
    originalError: error,
  };

  if (isClientError(error)) {
    unifiedError = errorHandler(error, unifiedError);
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
