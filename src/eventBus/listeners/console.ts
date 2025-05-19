import type { ListenersMap } from "type-safe-event-bus";
import { eventTypes } from "../events";

const options = {} as any;

if (import.meta.env.DEV) {
  for (const option in eventTypes) {
    options[option] = (e: any) => {
      console.log("event", option, e);
    };
  }
}

export default options satisfies ListenersMap;
