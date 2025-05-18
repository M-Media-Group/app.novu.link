import { z } from "zod";

export const createRedirectRequestSchema = z.object({
  name: z.string().min(1),
  default_endpoint: z.coerce.string().url(),
});

export const createRedirectResponseSchema = z.object({
  uuid: z.string(),
  team_id: z.number().nullable(),
  name: z.string(),
  enable_analytics: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable().optional(),
  todays_clicks_count: z.number().optional(),
  yesterdays_clicks_up_to_now_count: z.number().optional(),
  endpoints: z.array(z.any()).optional(), // Replace z.any() with EndpointSchema if you have it
  sources: z.array(z.any()).optional(), // Replace z.any() with PlacementSchema if you have it
  qr_designs: z.array(z.any()).optional(), // Replace z.any() with QRDesignSchema if you have it
  default_qr_design: z.any().optional(), // Replace z.any() with QRDesignSchema if you have it
  webhooks: z.array(z.any()).optional(), // Replace z.any() with WebhookSchema if you have it
  alerts: z.array(z.any()).optional(), // Replace z.any() with AlertSchema if you have it
  analytics_integrations: z.array(z.any()).optional(), // Replace z.any() with AnalyticsIntegrationSchema if you have it
  subscribed_at: z.coerce.date().nullable(),
  remaining_clicks: z.number(),
  heatmap: z.array(z.array(z.number())).optional(),
});

export const getRedirectsResponseSchema = z.array(createRedirectResponseSchema);

export const getRedirectResponseSchema = createRedirectResponseSchema;
