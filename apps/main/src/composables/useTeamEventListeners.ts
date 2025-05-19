// composables/useTeamEventListeners.ts
import { useTeamStore } from "@/stores/team";
import { useEventsBus } from "@/eventBus/events";
import { useRouter } from "vue-router";

export const useTeamEventListeners = () => {
  const store = useTeamStore();
  const $bus = useEventsBus();
  const router = useRouter();

  $bus.$on("logged_in", store.getUserTeams);
  $bus.$on("registered", store.getUserTeams);
  $bus.$on("confirmed_otp", store.getUserTeams);
  $bus.$on("added_payment_method", store.getUserTeams);

  $bus.$on("updated_team", (id: number) => {
    store.getUserTeams();
  });

  $bus.$on("changed_team", (id: number) => {
    store.setActiveTeam(id);
    router.push({ name: "dashboard" });
  });

  $bus.$on("created_team", async () => {
    await store.getUserTeams();
    store.setNewestTeamAsActive();
  });
};
