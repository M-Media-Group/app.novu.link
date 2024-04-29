import { event, optIn, optOut, purchase, set } from "vue-gtag";
import type { eventTypes } from "../events";

// Define fbq for Facebook Pixel as a function (declare it)
/** @todo add fbq types */
declare function fbq(...args: any[]): void;

export default {
  enabled_analytics: () => {
    optIn();
    event("analytics_opt_in");
  },
  disabled_analytics: () => {
    event("analytics_opt_out");
    optOut();
  },
  viewed_page: (to: any) => {
    // pageview(to); // To confirm, seems Google is auto-tracking this
    // fbq("track", "PageView"); // To confirm, it is likely done automatically already by using the history listener
  },
  logged_in: () => {
    event("login");
  },
  registered: () => {
    event("sign_up");
    fbq("track", "CompleteRegistration");
  },
  added_payment_method: () => {
    event("add_payment_info", {
      payment_type: "card",
    });
    fbq("track", "AddPaymentInfo");
  },
  changed_locale: (locale: string) => {
    set({ locale: locale });
    event("change_locale", {
      locale: locale,
    });
  },
  changed_theme: (theme: string) => {
    set({ theme: theme });
    event("change_theme", {
      theme: theme,
    });
  },
  created_personal_access_token: () => {
    event("create_personal_access_token");
  },
  started_subscription: () => {
    // generate a random transaction id based on time
    const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
    purchase({
      transaction_id: transactionId,
      value: 36,
    });
    fbq("track", "Purchase", {
      value: 36,
      currency: "EUR",
    });
  },
  created_redirect: () => {
    event("create_redirect");
  },
  created_endpoint: () => {
    event("create_endpoint");
    fbq("trackCustom", "CreateEndpoint");
  },
} as Record<eventTypes, any>;
