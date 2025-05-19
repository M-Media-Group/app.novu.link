import { z } from "zod";

export const bestRedirectSchema = z.object({
  uuid: z.string(),
  team_id: z.number(),
  name: z.string(),
  enable_analytics: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable(),
  clicks_count: z.number(),
});

export const clicksSchema = z.object({
  total: z.number(),
  today: z.number(),
});

export const dashboardSchema = z.object({
  clicks: clicksSchema,
  bestRedirect: bestRedirectSchema,
  hasPaymentMethodSet: z.boolean(),
  hasBillableRedirects: z.boolean(),
  clicksByMinuteLast30: z.array(
    z.object({
      redirect_uuid: z.string().optional(),
      datetime: z.string(),
      click_count: z.number(),
    })
  ),
});

export const getDashboardResponseSchema = dashboardSchema;
