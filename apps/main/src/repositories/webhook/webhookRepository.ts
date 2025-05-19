import type { z } from "zod";
import { apiServiceCall } from "../../services/api/apiServiceCall";

import {
  createWebhookRequestSchema,
  getSupportedWebhookEventsResponseSchema,
} from "./webhookSchema";

export const getSupportedWebhookEvents = async () => {
  return await apiServiceCall(
    "/api/v1/webhooks/events",
    "get",
    undefined,
    undefined,
    getSupportedWebhookEventsResponseSchema
  );
};

import $bus from "@/eventBus/events";

export const createWebhook = async (
  data: Partial<z.infer<typeof createWebhookRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.redirect_uuid}/webhooks`,
    "post",
    data,
    createWebhookRequestSchema
  );

  $bus.$emit("created_webhook");

  return response;
};
