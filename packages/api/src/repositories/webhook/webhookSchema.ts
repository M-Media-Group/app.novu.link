import { z } from "zod";

export const getSupportedWebhookEventsResponseSchema = z.array(z.string());

export const createWebhookRequestSchema = z.object({
  url: z.string().url(),
  event_types: z.array(z.string()),
  redirect_uuid: z.string(),
});
