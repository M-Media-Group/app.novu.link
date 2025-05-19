import { z } from "zod";
import { getRedirectResponseSchema } from "../redirect/redirectSchema";

export const teamSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  personal_team: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  is_billing_exempt: z.boolean(),
  stripe_id: z.string().nullable().optional(),
  pm_type: z.string().nullable().optional(),
  pm_last_four: z.string().length(4).nullable().optional(),
  trial_ends_at: z.coerce.date().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});

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
  redirects: z.array(getRedirectResponseSchema).optional(),
  team: teamSchema.optional(),
});

export const supportedIntegrationSchema = z.object({
  name: z.string(),
  pretty_name: z.string(),
  url: z.string(),
  debug_url: z.string().optional(),
  fields: supportedIntegrationFieldsSchema,
});

export const getUserTeamsResponseSchema = z.array(teamSchema);

export const updateTeamRequestSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const switchTeamRequestSchema = z.object({
  team_id: z.number(),
});

export const createTeamRequestSchema = z.object({
  name: z.string(),
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
