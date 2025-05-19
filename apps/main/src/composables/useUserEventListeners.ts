// composables/useTeamEventListeners.ts
import { useUserStore } from "@/stores/user";
import { useEventsBus } from "@/eventBus/events";
import { useRouter } from "vue-router";

export function useUserEventListeners() {
  const store = useUserStore();
  const $bus = useEventsBus();
  const router = useRouter();

  $bus.$on("logged_in", () => {
    store.getUser();
  });

  $bus.$on("registered", () => {
    store.getUser();
  });

  $bus.$on("logged_out", () => {
    store.logoutInStore();
    router.push({ name: "login" });
  });
}
