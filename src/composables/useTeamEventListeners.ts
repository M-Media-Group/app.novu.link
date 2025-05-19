// composables/useTeamEventListeners.ts
import { useTeamStore } from "@/stores/team";
import { eventTypes, useEventsBus } from "@/eventBus/events";
import { useRouter } from "vue-router";

export function useTeamEventListeners() {
  const store = useTeamStore();
  const $bus = useEventsBus();
  const router = useRouter();

  $bus.$on(eventTypes.logged_in, store.getUserTeams);
  $bus.$on(eventTypes.registered, store.getUserTeams);
  $bus.$on(eventTypes.confirmed_otp, store.getUserTeams);
  $bus.$on(eventTypes.added_payment_method, store.getUserTeams);

  $bus.$on(eventTypes.logged_out, () => {
    store.$reset(); // if $reset defined, or manually clear state
  });

  $bus.$on(eventTypes.changed_team, (id: number) => {
    store.setActiveTeam(id);
    router.push({ name: "dashboard" });
  });

  $bus.$on(eventTypes.created_team, async () => {
    await store.getUserTeams();
    store.setNewestTeamAsActive();
  });
}
