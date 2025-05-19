// composables/useTeamEventListeners.ts
import { useTeamStore } from "@/stores/team";
import { useEventsBus } from "@/eventBus/events";
import { useRouter } from "vue-router";
import { type Ref, onMounted, onUnmounted } from "vue";
import type { Listener } from "type-safe-event-bus";

export const useRedirectEventListeners = (
  callback: Listener<any>,
  localClicks: Ref<number>
) => {
  const teamStore = useTeamStore();
  const $bus = useEventsBus();
  const router = useRouter();

  const redirectToCreate = () => {
    router.push("/redirects/create");
  };

  const incrementClicks = () => {
    localClicks.value++;
  };

  onMounted(() => {
    $bus.$on("started_subscription", callback);
    $bus.$on("unsubscribed", callback);
    $bus.$on("updated_redirect", callback);
    $bus.$on("updated_endpoint", callback);
    $bus.$on("deleted_endpoint", callback);
    $bus.$on("deleted_redirect", redirectToCreate);
    $bus.$on("set_active_team", callback);
    $bus.$on("created_qr_design", callback);
    $bus.$on("created_webhook", callback);
    $bus.$on("created_alert", callback);
    $bus.$on("tested_redirect", incrementClicks);
  });

  onUnmounted(() => {
    $bus.$off("started_subscription", callback);
    $bus.$off("unsubscribed", callback);
    $bus.$off("updated_redirect", callback);
    $bus.$off("updated_endpoint", callback);
    $bus.$off("deleted_endpoint", callback);
    $bus.$off("deleted_redirect", redirectToCreate);
    $bus.$off("set_active_team", callback);
    $bus.$off("created_qr_design", callback);
    $bus.$off("created_webhook", callback);
    $bus.$off("created_alert", callback);
    $bus.$off("tested_redirect", incrementClicks);
  });
};
