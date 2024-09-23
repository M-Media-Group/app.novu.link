import { useUserStore } from "@/stores/user";
import type { RouteLocationRaw } from "vue-router";
import { baseGate } from "@m-media/vue3-gate-keeper";

/** A middleware that checks if the user is authenticated */
export default class extends baseGate {
  form = "LoginOrRegister";

  async handle() {
    const store = useUserStore();
    await store.isReady;
    if (!store.isAuthenticated) {
      return this.fail();
    }
  }

  route(): false | RouteLocationRaw {
    // If the route was supposed to be login-otp, we should redirect to login-otp, else just login
    // If we have a cookie created_when_not_logged_in and the user is not authenticated, we should redirect to login-otp
    const hasCookie = document.cookie.includes("created_when_not_logged_in");
    return {
      name: hasCookie ? "login-otp" : "login",
    };
  }
}
