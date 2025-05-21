import type { z } from "zod";
import { apiServiceCall } from "./../../services/apiServiceCall.js";

import {
  createWebhookRequestSchema,
  getSupportedWebhookEventsResponseSchema,
} from "./webhookSchema.js";

import { getEventBus } from "./../../services/apiClient.js";

export const getSupportedWebhookEvents = async () => {
  return await apiServiceCall(
    "/api/v1/webhooks/events",
    "get",
    undefined,
    undefined,
    getSupportedWebhookEventsResponseSchema
  );
};


export const createWebhook = async (
  data: Partial<z.infer<typeof createWebhookRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.redirect_uuid}/webhooks`,
    "post",
    data,
    createWebhookRequestSchema
  );

  getEventBus()?.$emit("created_webhook");

  return response;
};
