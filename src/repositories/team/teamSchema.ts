import { z } from "zod";

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
