import type { ListenersMap } from "type-safe-event-bus";

const options = {} as ListenersMap;

const eventTypes = {
  enabled_analytics: void 0,
  disabled_analytics: void 0,
  went_offline: void 0,
  came_online: void 0,
  viewed_page: void 0,
  logged_in: void 0,
  logged_out: void 0,
  sent_reset_password_email: void 0,
  reset_password: void 0,
  confirmed_password: void 0,
  confirmed_email: void 0,
  updated_user: void 0,
  registered: void 0,
  updated_redirect: void 0,
} satisfies ListenersMap;

if (import.meta.env.DEV) {
  for (const option in eventTypes) {
    options[(option as keyof ListenersMap)] = (e: unknown) => {
      console.log("event", option, e);
    };
  }
}

export default options satisfies ListenersMap;
