import { type App, inject } from "vue";

export enum eventTypes {
  enabled_analytics = "enabled_analytics",
  disabled_analytics = "disabled_analytics",
  went_offline = "went_offline",
  came_online = "came_online",
  viewed_page = "viewed_page",
  logged_in = "logged_in",
  logged_out = "logged_out",
  sent_reset_password_email = "sent_reset_password_email",
  reset_password = "reset_password",
  confirmed_password = "confirmed_password",
  confirmed_email = "confirmed_email",
  updated_user = "updated_user",
  registered = "registered",
  created_personal_access_token = "created_personal_access_token",
  deleted_personal_access_token = "deleted_personal_access_token",
  added_payment_method = "added_payment_method",
  changed_locale = "changed_locale",
  changed_theme = "changed_theme",
  changed_team = "changed_team",
  set_active_team = "set_active_team",
  confirmed_willingness_to_start_subscription = "confirmed_willingness_to_start_subscription",
  started_subscription = "started_subscription",
  unsubscribed = "unsubscribed",
  created_redirect = "created_redirect",
  created_endpoint = "created_endpoint",
  deleted_endpoint = "deleted_endpoint",
  updated_redirect = "updated_redirect",
  updated_endpoint = "updated_endpoint",
  copied_redirect = "copied_redirect",
  tested_redirect = "tested_redirect",
  deleted_redirect = "deleted_redirect",
  downloaded_redirect_qr_code = "downloaded_redirect_qr_code",
  sent_otp = "sent_otp",
  confirmed_otp = "confirmed_otp",
  created_qr_design = "created_qr_design",
  updated_qr_design = "updated_qr_design",
  deleted_qr_design = "deleted_qr_design",
  created_webhook = "created_webhook",
  updated_webhook = "updated_webhook",
  deleted_webhook = "deleted_webhook",
  created_alert = "created_alert",
  updated_alert = "updated_alert",
  deleted_alert = "deleted_alert",
  created_analytics_integration = "created_analytics_integration",
  updated_analytics_integration = "updated_analytics_integration",
  deleted_analytics_integration = "deleted_analytics_integration",
  created_product_order = "created_product_order",
}

type EventsObject = { [P in eventTypes]?: any };

/**
 * A simple event bus.
 */
class Events {
  /** The events object which contains all the events and their listeners */
  events: EventsObject;

  constructor(events = {}) {
    this.events = events;
  }

  /** Add an event listener on the given event */
  $on(eventName: eventTypes, fn: Function) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }

  /** Remove an event listener from the given event. The function must be the same reference as the one passed to $on */
  $off(eventName: eventTypes, fn: Function) {
    if (this.events[eventName]) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  }

  /** Emit an event with the given data */
  $emit(eventName: eventTypes, data = null as any) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (fn: (arg0: any) => void) {
        fn(data);
      });
    }
  }
}

/** The global event bus instance */
const eventsInstance = new Events();

export class Listeners {
  constructor(...events: EventsObject[]) {
    events.forEach((event: EventsObject) => {
      Object.keys(event).forEach((eventName: any) => {
        eventsInstance.$on(eventName, event[eventName as eventTypes]);
      });
    });
  }
}

export const eventsBusKey = Symbol.for("eventsBusKey");

export const useEventsBus = () => {
  return inject(eventsBusKey) as Events;
};

// Currently unused
export const EventsPlugin = {
  install: (app: App<any>) => {
    app.provide(eventsBusKey, eventsInstance);
  },
};

export default eventsInstance;
