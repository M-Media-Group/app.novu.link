import { createApp } from "vue";
import { createPinia } from "pinia";

import axios from "axios";

import App from "./App.vue";
import router from "./router";

// Event bus listeners
import "./eventBus/listeners/index";

import VueGtagPlugin from "vue-gtag";
import VueHotjar from "vue-hotjar-next";

import "./assets/main.css";
import i18n, { SUPPORT_LOCALES } from "./locales/i18n";
import { ThemePlugin } from "./themes/useTheme";
import { gatePlugin } from "@m-media/vue3-gate-keeper";

import gates from "./router/gates";
import { metaTagPlugin } from "@m-media/vue3-meta-tags";
import { EventsPlugin } from "./eventBus/events";

const app = createApp(App);

axios.defaults.withXSRFToken = true;
axios.defaults.withCredentials = true;
// Set accept header
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
// axios.defaults.baseURL = import.meta.env.VITE_API_URL;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const gates = router.currentRoute.value.meta?.gates as string[] | undefined;
    if (error.response?.status === 401 && gates?.includes("auth")) {
      router.push({ name: "login-otp" });
    } else if (error.response?.status === 429) {
      router.push({ name: "429" });
    } else if (error.response?.status === 401) {
      router.push({ name: "login" });
    }
    return Promise.reject(error);
  }
);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.use(
  gatePlugin,
  {
    gateInstances: gates,
  },
  router
);

app.use(
  metaTagPlugin,
  {
    defaultName: import.meta.env.VITE_APP_NAME,
    defaultLocale: i18n.global.locale.value,
    locales: SUPPORT_LOCALES,
    preconnect: [
      import.meta.env.VITE_API_URL,
      "https://js.stripe.com",
      "https://hooks.stripe.com",
      "https://api.stripe.com",
      "https://www.googletagmanager.com",
      "https://connect.facebook.net",
      "https://script.hotjar.com",
      "https://static.hotjar.com",
    ],
    textCallback: (text: string) => {
      return i18n.global.t(text);
    },
  },
  router
);

app.use(
  VueGtagPlugin,
  {
    enabled: import.meta.env.PROD,
    bootstrap: import.meta.env.PROD,
    appName: import.meta.env.VITE_APP_NAME,
    config: { id: import.meta.env.VITE_GA_MEASUREMENT_ID },
    pageTrackerEnabled: false,
  },
  router
);

app.use(VueHotjar, {
  id: Number(import.meta.env.VITE_HOTJAR_MEASUREMENT_ID),
  isProduction: import.meta.env.PROD,
  snippetVersion: 6,
});

app.use(EventsPlugin);

app.use(ThemePlugin);

app.mount("#app");
