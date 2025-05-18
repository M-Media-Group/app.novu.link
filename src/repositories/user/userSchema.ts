import { z } from "zod";

const emailSchema = z.string().email("Invalid email format");
const phoneNumberSchema = z.string().min(5).startsWith("+", {
  message: "Phone number must start with +",
});
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: passwordSchema,
  name: z.string().min(2),
  terms: z.coerce.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export const registerResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: emailSchema,
  email_verified_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.enum(["on", "off"]),
});

export const requestOtpRequestSchema = z.union([
  // Schema for the email payload
  z.object({
    email: emailSchema,
  }),
  z.object({
    phone_number: phoneNumberSchema,
  }),
]);

export const confirmOtpRequestSchema = z.object({
  otp: z.string().min(6).max(6),
});

export const resendEmailConfirmationUserRequestSchema = z.object({
  email: emailSchema,
});

export const sendPasswordResetEmailRequestSchema = z.object({
  email: emailSchema,
});

export const sendPasswordResetRequestSchema = z.object({
  email: emailSchema,
  token: z.string(),
  password: passwordSchema,
  password_confirmation: passwordSchema,
});

export const confirmPasswordRequestSchema = z.object({
  password: passwordSchema,
});

export const updateRequestSchema = z
  .object({
    name: z.string().min(2),
    email: emailSchema,
    phone_number: phoneNumberSchema,
  })
  .partial();

export const getPersonalAccessTokenResponseSchema = z.object({
  id: z.number(),
  tokenable_id: z.number(),
  name: z.string().nullable(),
  abilities: z.array(z.string()),
  last_used_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const getPersonalAccessTokensResponseSchema = z
  .array(getPersonalAccessTokenResponseSchema)
  .optional();

export const createPersonalAccessTokenRequestSchema = z.object({
  name: z.string().min(2),
});

export const deletePersonalAccessTokenRequestSchema = z.object({
  id: z.number(),
});

export const teamSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  personal_team: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  is_billing_exempt: z.boolean(),
  stripe_id: z.string(),
  pm_type: z.string(),
  pm_last_four: z.string().length(4),
  trial_ends_at: z.coerce.date().nullable(),
});

export const getUserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: emailSchema,
  email_verified_at: z.coerce.date().nullable(),
  two_factor_confirmed_at: z.coerce.date().nullable(),
  current_team_id: z.number(),
  profile_photo_path: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  phone_number: phoneNumberSchema.nullable(),
  phone_number_verified_at: z.coerce.date().nullable(),
  last_login_at: z.coerce.date().nullable(),
  profile_photo_url: z.string(),
  current_team: teamSchema,
});

export const checkEmailRequestSchema = z.object({
  email: emailSchema,
});
