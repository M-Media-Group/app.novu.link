/**
 * Determine if the status code is an error that should be displayed to the user as an error, commonly with a "Fix now" message.
 * @param code
 * @returns
 */
export const isError = (code: number) => {
  return (
    code &&
    // These are errors
    (code >= 400 || code < 200) &&
    // These are not errors that the user should be concerned about
    !(code === 429 || code === 401 || code === 204)
  );
};
