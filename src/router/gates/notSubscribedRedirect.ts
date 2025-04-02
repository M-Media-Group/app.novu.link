import { useTeamStore } from "@/stores/team";
import { getRedirect } from "@/useRedirects";
import { baseGate } from "@m-media/vue3-gate-keeper";

export default class extends baseGate {
  form = "UnsubscribeRedirect";

  async handle() {
    const teamStore = useTeamStore();

    if (teamStore.activeTeam?.is_billing_exempt === true) {
      return;
    }

    const redirectId = this.options.gateOptions?.redirectId;

    if (!redirectId) {
      return this.fail();
    }

    // Get the redirect to determine if we need to redirect
    const redirect = await getRedirect(redirectId);

    if (!redirect.data?.subscribed_at) {
      return;
    }

    return this.fail();
  }
}
