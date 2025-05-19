import { z } from "zod";
import { getRedirectsResponseSchema } from "../redirect/redirectSchema";
import { teamSchema } from "../team/teamSchema";

export const supportedIntegrationFieldsSchema = z.object({
  id: z.string(),
  secret: z.string(),
  debug_code: z.string().optional(),
});

export const analyticsIntegrationSchema = z.object({
  id: z.number(),
  name: z.string(),
  team_id: z.number(),
  type: z.string(),
  external_id: z.string(),
  user_id: z.number(),
  debug: z.boolean(),
  debug_code: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  redirects: getRedirectsResponseSchema.optional(),
  team: teamSchema.optional(),
});

export const supportedIntegrationSchema = z.object({
  name: z.string(),
  pretty_name: z.string(),
  url: z.string(),
  debug_url: z.string().optional(),
  fields: supportedIntegrationFieldsSchema,
});

export const getAnalyticsIntegrationsResponseSchema = z.array(
  analyticsIntegrationSchema
);

export const deleteAnalyticsIntegrationRequestSchema = z.object({
  id: z.number(),
});

export const createAnalyticsIntegrationRequestSchema = z.object({
  type: z.string().or(z.number()),
  external_id: z.string(),
  external_secret: z.string(),
  debug: z.boolean(),
  name: z.string(),
  debug_code: z.string().nullable().optional(),
});

export const getSupportedAnalyticsIntegrationsResponseSchema = z.array(
  supportedIntegrationSchema
);

export const toggleRedirectAnalyticsIntegrationRequestSchema = z.object({
  redirect_id: z.string(),
  integration_id: z.number(),
});
