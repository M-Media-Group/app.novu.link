import type { ListenersMap } from "type-safe-event-bus";

export default {
  logged_in: (e: unknown) => {
    // Send a postMessage event
    window.parent.postMessage(
      {
        type: "logged_in",
        data: e,
      },
      "*"
    );
  },
} satisfies ListenersMap;
