import { z } from "zod";

import { createRedirectResponseSchema } from "../redirect/redirectSchema";

export const alertLogSchema = z.object({
  id: z.number(),
  redirect_alert_id: z.number(),
  click_count: z.number(),
  triggered_at: z.string(),
  type: z.string(),
  condition: z.string(),
  target: z.number(),
  time_window: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const alertSchema = z.object({
  id: z.number(),
  redirect_uuid: z.string(),
  user_id: z.number(),
  type: z.string(),
  condition: z.string(),
  target: z.number(),
  time_window: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  logs: z.array(alertLogSchema).optional(),
  redirect: createRedirectResponseSchema.optional(),
});

export const createAlertRequestSchema = alertSchema.pick({
  redirect_uuid: true,
  type: true,
  condition: true,
  target: true,
  time_window: true,
});

export const getAlertsResponseSchema = z.array(alertSchema);
