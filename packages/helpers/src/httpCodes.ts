/**
 * Determine if the status code is an error that should be displayed to the user as an error, commonly with a "Fix now" message.
 * @param code
 * @returns true if the error code is of any status code: 400 or higher, or lower than 200, but not 429, 401, 204, or 403.
 */
export const isError = (code: number): boolean => {
  return (
    code &&
    // These are errors
    (code >= 400 || code < 200) &&
    // These are not errors that the user should be concerned about
    !(code === 429 || code === 401 || code === 204 || code === 403)
  ) || code === 0;
};
