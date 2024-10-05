import type { RouteLocationRaw } from "vue-router";
import { baseGate } from "@m-media/vue3-gate-keeper";
import { useTeamStore } from "@/stores/team";

/** A middleware that checks if the user is authenticated */
export default class extends baseGate {
  form = "AddPaymentMethod";

  async handle() {
    const store = useTeamStore();
    // check if the user has a payment method
    const hasPaymentMethod =
      store.activeTeam?.pm_type && store.activeTeam?.stripe_id;
    // if not, redirect to the add payment method page
    if (!hasPaymentMethod) {
      return this.fail();
    }
  }

  route(): false | RouteLocationRaw {
    return {
      name: "add-payment-method",
    };
  }
}
