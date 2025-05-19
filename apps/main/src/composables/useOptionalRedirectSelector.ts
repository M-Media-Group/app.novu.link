import { defineAsyncComponent, ref, watch } from "vue";

export function useOptionalRedirectSelector(props: { redirectId?: string }) {
  const RedirectSelector = defineAsyncComponent(
    () => import("@/components/RedirectSelector.vue")
  );

  const activeRedirectId = ref(props.redirectId || null);

  watch(
    () => props.redirectId,
    (newVal) => {
      if (newVal) {
        activeRedirectId.value = newVal;
      }
    }
  );
  return { RedirectSelector, activeRedirectId };
}
