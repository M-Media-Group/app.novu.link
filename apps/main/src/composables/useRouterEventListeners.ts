// composables/useTeamEventListeners.ts
import { useEventsBus } from "@/eventBus/events";
import { useRouter } from "vue-router";
import type { UnifiedError } from "@novulink/api";

export const useRouterEventListeners = () => {
    const $bus = useEventsBus();

    const router = useRouter();
    $bus.$on("http_error", async (error: Partial<UnifiedError>) => {
        const gates = router.currentRoute.value.meta?.gates as string[] | undefined;
        if (error.status === 401 && gates?.includes("auth")) {
            router.push({ name: "login-otp" });
        } else if (error.status === 429) {
            router.push({ name: "429" });
        }
    });
};
