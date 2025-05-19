import type { ListenersMap } from "type-safe-event-bus";
import { eventTypes } from "../events";

export default {
  logged_in: (e: any) => {
    // Send a postMessage event
    window.parent.postMessage(
      {
        type: eventTypes.logged_in,
        data: e,
      },
      "*"
    );
  },
} satisfies ListenersMap;
