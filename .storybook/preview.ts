import type { Preview, VueRenderer } from "@storybook/vue3";
import { withThemeByDataAttribute } from "@storybook/addon-themes";

import "@/assets/main.css";

import i18n from "../src/locales/i18n";
import { setup } from "@storybook/vue3";
import { type App } from "vue";
import { EventsPlugin } from "../src/eventBus/events";
import { createPinia } from "pinia";
import router, { navIsLoading } from "../src/router";
import { vueRouter } from "storybook-vue3-router";
import axios from "axios";
import { gatePlugin } from "@m-media/vue3-gate-keeper/src/gateKeeper";
import gates from "../src/router/gates";
import { useUserStore } from "../src/stores/user";

setup((app: App) => {
  app.use(createPinia());
  app.use(i18n);
  app.use(EventsPlugin);
  app.use(gatePlugin, { gateInstances: gates }, router);

  /** We need to set navIsLoading to false otherwise it never resolves becasuse the router guards don't seem to be called @todo check this */
  navIsLoading.value = false;

  axios.defaults.withXSRFToken = true;
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  const store = useUserStore();
  store.attemptedToFetchUser = true;
  store.isLoading = false;
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Don/t show background color for the preview since we use the light/dark switcher
    backgrounds: {
      disable: true,
    },
  },
};

preview.decorators = [
  /* this is the basic setup with no params passed to the decorator */
  vueRouter(),
  withThemeByDataAttribute<VueRenderer>({
    themes: {
      light: "light",
      dark: "dark",
    },
    defaultTheme: "light",
    attributeName: 'data-theme',
  }),
];


export default preview;
