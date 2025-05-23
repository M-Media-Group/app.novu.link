import { getRedirect } from "@/repositories/redirect/redirectRepository";
import { useTeamStore } from "@/stores/team";
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

    try {
      // Get the redirect to determine if we need to redirect
      const redirect = await getRedirect({ id: redirectId });

      if (redirect?.subscribed_at !== null) {
        throw new Error("Already subscribed");
      }
    } catch (error) {
      return this.fail();
    }
  }
}
