import analytics from "./analytics";
import console from "./console";
import notifications from "./notifications";
import broadcastChannel from "./broadcastChannel";
import { Listeners } from "type-safe-event-bus";
// import postMessage from "./postMessage";

const isProduction = import.meta.env.PROD;

export default new Listeners(
  notifications,
  broadcastChannel,
  isProduction ? analytics : console
);
