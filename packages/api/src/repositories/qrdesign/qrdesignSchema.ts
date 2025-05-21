import { z } from "zod";
import { teamSchema } from "../team/teamSchema.js";
import { getUserResponseSchema } from "../user/userSchema.js";

export type HexColor = `#${string}`;

const hexColorSchema = z
  .string()
  .startsWith("#")
  .min(7)
  .max(7)
  .regex(/^#([0-9a-fA-F]{3}){1,2}$/, { message: "Invalid hex color" })
  .transform((val) => val as HexColor);

const schema = z.object({
  id: z.number().optional(),
  team_id: z.number().optional(),
  user_id: z.number().optional().nullable(),
  name: z.string().nullable(),
  color: hexColorSchema,
  background_color: hexColorSchema,
  error_correction_level: z.union([
    z.literal("low"),
    z.literal("medium"),
    z.literal("quartile"),
    z.literal("high"),
  ]),
  size: z.number().optional(),
  margin: z.number().optional(),
  round_block_size_mode: z.union([
    z.literal("enlarge"),
    z.literal("margin"),
    z.literal("shrink"),
    z.literal("none"),
  ]),
  block_shape: z.union([
    z.literal("circle"),
    z.literal("rounded"),
    z.literal("classy"),
    z.literal("classy-rounded"),
    z.literal("square"),
    z.literal("extra-rounded"),
  ]),
  corner_dot_shape: z.union([z.literal("circle"), z.literal("square")]),
  corner_shape: z.union([
    z.literal("square"),
    z.literal("rounded"),
    z.literal("circle"),
  ]),
  logo: z.string().optional().nullable(),
  logo_size: z.number().optional().nullable(),
  logo_punchout_background: z.boolean().optional(),
  last_scan_check_at: z.coerce.date().optional().nullable(),
  is_scannable: z.boolean().optional().nullable(),
  was_automatically_generated: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  team: teamSchema.optional(),
  user: getUserResponseSchema.optional(),
  pivot: z
    .object({
      is_default: z.boolean(),
    })
    .optional(),
});

export const createQrDesignRequestSchema = schema.extend({
  redirect_uuid: z.string(),
});

export const getQrDesignLogosResponseSchema = z.array(
  schema
    .pick({
      created_at: true,
      id: true,
      logo: true,
      name: true,
    })
    .required({
      id: true,
      logo: true,
      name: true,
    })
);
