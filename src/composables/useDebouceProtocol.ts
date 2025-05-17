// Assuming you have these utility functions available
import { debounce } from "@/helpers/debounce";
import { formatUrl } from "@/helpers/urlFormatter";
import { ref } from "vue";

/**
 * Composable for handling URL formatting and debouncing the update
 * of a reactive endpoint value.
 *
 * @param defaultEndpoint - A Vue Ref<string | undefined> that holds the endpoint value.
 * @returns An object containing the debounced function to call when the value changes.
 */
export function useUrlFormatter() {
  const endpointUrl = ref<string | null | undefined>(null);

  // Create the debounced function. It will format the URL and update the ref.
  const debounceAddProtocolIfMissing = debounce(
    (data: string) => {
      // Only format and update if the ref is not undefined
      if (endpointUrl.value !== undefined) {
        endpointUrl.value = formatUrl(data);
      }
    },
    500, // The debounce delay in milliseconds
    true // Use leading edge: the function is called immediately on the first trigger
  );

  // Return the debounced function so it can be used in the component
  return {
    endpointUrl,
    debounceAddProtocolIfMissing,
  };
}
