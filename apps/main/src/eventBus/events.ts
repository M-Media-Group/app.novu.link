import { type App, inject } from "vue";
import EventBus from "type-safe-event-bus";
import type { RouteLocationNormalized } from "vue-router";

declare module "type-safe-event-bus" {
  export interface EventTypesPayloads {
    copied_redirect: undefined;
    tested_redirect: undefined;
    downloaded_redirect_qr_code: undefined;
    changed_locale: string;
    changed_theme: string;
    viewed_page: RouteLocationNormalized & {
      name: string;
    };
    confirmed_email: undefined;
  }
}

export const eventsBusKey = Symbol.for("eventsBusKey");

export const useEventsBus = () => {
  return inject(eventsBusKey) as typeof EventBus;
};

// Currently unused
export const EventsPlugin = {
  install: (app: App<undefined>) => {
    app.provide(eventsBusKey, EventBus);
  },
};

export default EventBus;
