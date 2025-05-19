import { flattenObjectToDotNotationWithArrayAndStopAtKey } from "@/helpers/hasMethod";
import i18n from "@/locales/i18n";
import { errorHandler, isClientError } from "./clients/axios";
import { z } from "zod";

/**
 * Represents a unified error structure.
 */
export interface UnifiedError {
  /** A general category for the error (e.g., 'network', 'server', 'validation', 'unknown'). */
  type: "network" | "server" | "validation" | "unknown";
  /** A user-friendly message describing the error. */
  message: string;
  /** Optional details, especially for validation errors (e.g., field-specific messages). */
  details?: { [field: string]: string[] | string | undefined };
  /** The HTTP status code, if applicable. */
  status?: number;
  /** The original error object. */
  originalError: unknown; // Keep a reference to the original error
}

/**
 * Type guard to check if an error is our UnifiedError type.
 */
export function isUnifiedError(error: any): error is UnifiedError {
  return (
    error &&
    typeof error === "object" &&
    "type" in error &&
    "message" in error &&
    "originalError" in error
  );
}

export function assertIsUnifiedError(
  error: unknown
): asserts error is UnifiedError {
  if (!isUnifiedError(error)) {
    throw error;
  }
}

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
