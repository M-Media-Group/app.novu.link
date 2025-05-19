import { type App, inject } from "vue";
import EventBus from "type-safe-event-bus";
import type { EventTypesPayloads } from "type-safe-event-bus";
import type { RouteLocationNormalized } from "vue-router";

declare module "type-safe-event-bus" {
  export interface EventTypesPayloads {
    enabled_analytics: void;
    disabled_analytics: void;
    went_offline: void;
    came_online: void;
    viewed_page: RouteLocationNormalized & {
      name: string;
    };
    logged_in: void;
    logged_out: void;
    sent_reset_password_email: void;
    reset_password: void;
    confirmed_password: void;
    confirmed_email: void;
    updated_user: void;
    registered: void;
    created_personal_access_token: void;
    deleted_personal_access_token: void;
    added_payment_method: void;
    changed_locale: string;
    changed_theme: string;
    created_team: void;
    changed_team: number;
    updated_team: number;
    set_active_team: void;
    confirmed_willingness_to_start_subscription: void;
    started_subscription: void;
    unsubscribed: void;
    created_redirect: void;
    created_endpoint: void;
    deleted_endpoint: number;
    updated_redirect: string;
    updated_endpoint: number;
    copied_redirect: void;
    tested_redirect: void;
    deleted_redirect: string;
    downloaded_redirect_qr_code: void;
    sent_otp: void;
    confirmed_otp: void;
    created_qr_design: void;
    updated_qr_design: void;
    deleted_qr_design: void;
    created_webhook: void;
    updated_webhook: void;
    deleted_webhook: void;
    created_alert: void;
    updated_alert: void;
    deleted_alert: void;
    created_analytics_integration: void;
    updated_analytics_integration: void;
    deleted_analytics_integration: void;
    created_product_order: void;
  }
}

export const eventTypes = Object.fromEntries(
  Object.keys({} as EventTypesPayloads).map((key) => [key, key])
) as { [K in keyof EventTypesPayloads]: K };

export const eventsBusKey = Symbol.for("eventsBusKey");

export const useEventsBus = () => {
  return inject(eventsBusKey) as typeof EventBus;
};

// Currently unused
export const EventsPlugin = {
  install: (app: App<any>) => {
    app.provide(eventsBusKey, EventBus);
  },
};

export default EventBus;
