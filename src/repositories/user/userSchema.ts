import { z } from "zod";
import { teamSchema } from "../team/teamSchema";

const emailSchema = z.string().email("Invalid email format");
const phoneNumberSchema = z.string().min(5).max(20).startsWith("+", {
  message: "Phone number must start with +",
});
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

const passwordWithConfirmation = z.object({
  password: passwordSchema,
  password_confirmation: passwordSchema,
});

const emailPasswordSchema = z
  .object({
    email: emailSchema,
  })
  .merge(passwordWithConfirmation);

export const registerRequestSchema = z
  .object({
    name: z.string().min(2),
    terms: z.coerce.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .merge(emailPasswordSchema);

export const registerResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: emailSchema,
  email_verified_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const loginRequestSchema = z
  .object({
    remember: z.enum(["on", "off"]),
  })
  .merge(emailPasswordSchema.omit({ password_confirmation: true }));

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
  otp: z.string().length(6),
});

export const resendEmailConfirmationUserRequestSchema = z.object({
  email: emailSchema,
});

export const sendPasswordResetEmailRequestSchema = z.object({
  email: emailSchema,
});

export const sendPasswordResetRequestSchema = z
  .object({
    token: z.string(),
  })
  .merge(emailPasswordSchema);

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

export const getUserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: emailSchema,
  email_verified_at: z.coerce.date().nullable(),
  two_factor_confirmed_at: z.coerce.date().nullable(),
  current_team_id: z.number().nullable(),
  profile_photo_path: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  phone_number: phoneNumberSchema.nullable(),
  phone_number_verified_at: z.coerce.date().nullable(),
  last_login_at: z.coerce.date().nullable(),
  profile_photo_url: z.string().url().nullable(),
  current_team: teamSchema,
});

export const checkEmailRequestSchema = z.object({
  email: emailSchema,
});
