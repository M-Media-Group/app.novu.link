/**
 * Represents a unified error structure.
 */
export interface UnifiedError {
  /** A general category for the error (e.g., 'network', 'server', 'validation', 'unknown'). */
  type: "network" | "server" | "validation" | "unknown";
  /** A user-friendly message describing the error. */
  message: string;
  /** Optional details, especially for validation errors (e.g., field-specific messages). */
  details?: { [field: string]: string[] | string };
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
    throw new Error("Not a UnifiedError");
  }
}
