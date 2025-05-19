// composables/useTeamEventListeners.ts
import { useUserStore } from "@/stores/user";
import { eventTypes, useEventsBus } from "@/eventBus/events";

export function useUserEventListeners() {
  const store = useUserStore();
  const $bus = useEventsBus();

  $bus.$on(eventTypes.logged_in, () => {
    store.getUser();
  });

  $bus.$on(eventTypes.registered, () => {
    store.getUser();
  });

  $bus.$on(eventTypes.logged_out, () => {
    store.logoutInStore();
  });
}
