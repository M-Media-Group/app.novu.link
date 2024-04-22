import { baseGate } from "@m-media/vue3-gate-keeper";
import axios from "axios";

export default class extends baseGate {
  async handle() {
    const redirectId = this.options.gateOptions?.redirectId;

    if (!redirectId) {
      return this.fail();
    }

    // Get the redirect to determine if we need to redirect
    const redirect = await axios.get(`/api/v1/redirects/${redirectId}`);

    if (redirect.data?.endpoints?.length > 1) {
      return;
    }
    return this.fail();
  }
}
