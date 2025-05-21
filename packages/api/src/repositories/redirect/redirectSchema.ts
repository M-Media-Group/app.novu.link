import { z } from "zod";
import { RuleCheckSchema } from "../rule/ruleSchema.js";

const coercedDate = z.coerce.date();

const RuleSchema = z.intersection(
  z.object({
    id: z.number().optional(),
    rule_group_id: z.number().optional(),
    created_at: coercedDate.optional(),
    updated_at: coercedDate.optional(),
  }),
  RuleCheckSchema // the union schema
);

const RuleGroupSchema = z.object({
  match_all: z.coerce.boolean().nullable().optional(),
  rules: z.array(RuleSchema),
});

const FullRuleGroupSchema = z.object({
  rule_groups: z.array(RuleGroupSchema),
});

export const createRedirectRequestSchema = z.object({
  name: z.string().min(2),
  default_endpoint: z.string().url(),
  preserve_query_parameters: z.boolean().optional(),
  enable_analytics: z.boolean().optional(),
});

export const createRedirectResponseSchema = z.object({
  uuid: z.string(),
  team_id: z.number().nullable(),
  name: z.string(),
  enable_analytics: z.boolean(),
  created_at: coercedDate,
  updated_at: coercedDate,
  deleted_at: coercedDate.nullable().optional(),
  todays_clicks_count: z.number().optional(),
  yesterdays_clicks_up_to_now_count: z.number().optional(),
  endpoints: z.array(z.any()).optional(), // Replace z.any() with EndpointSchema if you have it
  sources: z.array(z.any()).optional(), // Replace z.any() with PlacementSchema if you have it
  qr_designs: z.array(z.any()).optional(), // Replace z.any() with QRDesignSchema if you have it
  default_qr_design: z.any().optional(), // Replace z.any() with QRDesignSchema if you have it
  webhooks: z.array(z.any()).optional(), // Replace z.any() with WebhookSchema if you have it
  alerts: z.array(z.any()).optional(), // Replace z.any() with AlertSchema if you have it
  analytics_integrations: z.array(z.any()).optional(), // Replace z.any() with AnalyticsIntegrationSchema if you have it
  subscribed_at: coercedDate.nullable(),
  remaining_clicks: z.number(),
  heatmap: z.array(z.array(z.number())).optional(),
});

export const getRedirectRequestSchema = z.object({
  id: z.string(),
});

export const getRedirectsResponseSchema = z.array(createRedirectResponseSchema);

export const clicksByTimeOfDaySchema = z.object({
  redirect_uuid: z.string().optional(),
  datetime: z.string(),
  click_count: z.number(),
});

export const getRedirectResponseSchema = createRedirectResponseSchema.merge(
  z.object({
    endpoints: z.array(
      z.object({
        id: z.number(),
        endpoint: z.string().url(),
        is_default: z.boolean(),
        preserve_query_parameters: z.boolean(),
        redirect_uuid: z.string(),
        order: z.number(),
        created_at: coercedDate,
        updated_at: coercedDate,
        last_scraped_at: coercedDate,
        last_http_code: z.number().nullable().optional(),
        rule_groups: z.array(
          z
            .object({
              id: z.number(),
              name: z.string().nullable(),
              endpoint_id: z.number(),
              created_at: coercedDate,
              updated_at: coercedDate,
            })
            .merge(RuleGroupSchema)
        ),
        clicks_by_minute: z.array(clicksByTimeOfDaySchema),
        clicks_by_time_of_day: z.array(clicksByTimeOfDaySchema),
      })
    ),
  })
);

export const updateRedirectRequestSchema = z
  .object({
    id: getRedirectRequestSchema.shape.id,
  })
  .merge(createRedirectRequestSchema.partial());

export const generalEndpointRequestSchema = z.object({
  id: getRedirectRequestSchema.shape.id,
  endpoint_id: z.number(),
});

export const updateRedirectEndpointRequestSchema = z
  .object({
    is_default: z.boolean().optional(),
    preserve_query_parameters: z.boolean().optional(),
    endpoint: z.string().url(),
  })
  .merge(generalEndpointRequestSchema);

export const nestedRedirect = z.object({
  uuid: z.string(),
  team_id: z.number(),
  name: z.string(),
  enable_analytics: z.boolean(),
  created_at: coercedDate,
  updated_at: coercedDate,
  deleted_at: coercedDate.nullable(),
  subscribed_at: coercedDate,
  remaining_clicks: z.number(),
});

export const updateRedirectEndpointResponseSchema = z.object({
  id: z.number(),
  endpoint: z.string().url(),
  is_default: z.boolean(),
  preserve_query_parameters: z.boolean(),
  redirect_uuid: z.string(),
  order: z.number(),
  created_at: coercedDate,
  updated_at: coercedDate,
  last_scraped_at: coercedDate.nullable(),
  last_http_code: z.number().nullable(),
  redirect: nestedRedirect,
});

export const addRedirectEndpointRequestSchema = z
  .object({
    id: getRedirectRequestSchema.shape.id,
  })
  .merge(updateRedirectEndpointRequestSchema.omit({ endpoint_id: true }))
  .merge(FullRuleGroupSchema);

export const startSubscriptionRequestSchema = generalEndpointRequestSchema.pick(
  {
    id: true,
  }
);
