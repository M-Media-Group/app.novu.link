import { event, optIn, optOut, pageview, set } from "vue-gtag";
import type { eventTypes } from "../events";
// Import the type fbq from facebook-pixel, but rename it to fbqType
// import type { fbq as fbqType } from "facebook-pixel";

// Define fbq for Facebook Pixel in the global scope
// declare global {
//   interface Window {
//     fbq: fbqType;
//   }
// }

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
    pageview(to);
    // fbq("track", "PageView");
  },
  logged_in: () => {
    event("login");
  },
  registered: () => {
    event("sign_up");
    // fbq("track", "CompleteRegistration");
  },
  added_payment_method: () => {
    event("add_payment_info", {
      payment_type: "card",
    });
    // fbq("track", "AddPaymentInfo");
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
    event("start_subscription");
    // fbq("track", "Purchase", {
    //   value: 36,
    //   currency: "EUR",
    // });
  },
  created_redirect: () => {
    event("create_redirect");
  },
  created_endpoint: () => {
    event("create_endpoint");
    // fbq("trackCustom", "CreateEndpoint");
  },
} as Record<eventTypes, any>;
