import { getRedirect } from "@/useRedirects";
import { baseGate } from "@m-media/vue3-gate-keeper";

export default class extends baseGate {
  async handle() {
    const redirectId = this.options.gateOptions?.redirectId;

    if (!redirectId) {
      return this.fail();
    }

    // Get the redirect to determine if we need to redirect
    const redirect = await getRedirect(redirectId);

    if (redirect.data?.subscribed_at !== null) {
      return;
    }
    return this.fail();
  }
}
