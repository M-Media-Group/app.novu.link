import { z } from "zod";
import {
  checkEmailRequestSchema,
  confirmOtpRequestSchema,
  confirmPasswordRequestSchema,
  createPersonalAccessTokenRequestSchema,
  deletePersonalAccessTokenRequestSchema,
  getPersonalAccessTokensResponseSchema,
  getUserResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  requestOtpRequestSchema,
  resendEmailConfirmationUserRequestSchema,
  sendPasswordResetEmailRequestSchema,
  sendPasswordResetRequestSchema,
  updateRequestSchema,
} from "./userSchema";
import { apiServiceCall } from "../apiServiceCall";

import $bus, { eventTypes } from "@/eventBus/events";

export const login = async (data: z.infer<typeof loginRequestSchema>) => {
  const response = await apiServiceCall(
    "/login",
    "post",
    data,
    loginRequestSchema
  );
  $bus.$emit(eventTypes.logged_in);
  return response;
};

export const register = async (data: z.infer<typeof registerRequestSchema>) => {
  const respone = await apiServiceCall(
    "/register",
    "post",
    data,
    registerRequestSchema
  );
  $bus.$emit(eventTypes.registered);
  return respone;
};

export const requestOtp = async (
  data: z.infer<typeof requestOtpRequestSchema>
) => {
  return await apiServiceCall(
    "/user/otp",
    "post",
    data,
    requestOtpRequestSchema
  );
};

export const confirmOtp = async (
  data: z.infer<typeof confirmOtpRequestSchema>
) => {
  return await apiServiceCall(
    "/user/otp/confirm",
    "post",
    data,
    confirmOtpRequestSchema,
    z.object({
      user_created: z.boolean(),
    })
  );
};

export const resendEmailConfirmation = async (
  data: Partial<z.infer<typeof resendEmailConfirmationUserRequestSchema>>
) => {
  return await apiServiceCall(
    "/email/verification-notification",
    "post",
    data,
    resendEmailConfirmationUserRequestSchema
  );
};

export const sendPasswordResetEmail = async (
  data: z.infer<typeof sendPasswordResetEmailRequestSchema>
) => {
  return await apiServiceCall(
    "/forgot-password",
    "post",
    data,
    sendPasswordResetEmailRequestSchema
  );
};

export const sendPasswordReset = async (
  data: z.infer<typeof sendPasswordResetRequestSchema>
) => {
  return await apiServiceCall(
    "/reset-password",
    "post",
    data,
    sendPasswordResetRequestSchema
  );
};

export const confirmPassword = async (
  data: z.infer<typeof confirmPasswordRequestSchema>
) => {
  return await apiServiceCall(
    "/user/confirm-password",
    "post",
    data,
    sendPasswordResetRequestSchema
  );
};

export const shouldConfirmPassword = async () => {
  return await apiServiceCall(
    "/user/confirmed-password-status",
    "get",
    undefined,
    undefined,
    z.object({
      confirmed: z.boolean(),
    })
  );
};

export const logout = async () => {
  return await apiServiceCall("/logout", "post");
};

export const update = async (data: z.infer<typeof updateRequestSchema>) => {
  return await apiServiceCall(
    "/user/profile-information",
    "put",
    data,
    updateRequestSchema
  );
};

export const getPersonalAccessTokens = async () => {
  return await apiServiceCall(
    "/user/personal-access-tokens",
    "get",
    undefined,
    undefined,
    getPersonalAccessTokensResponseSchema
  );
};

export const createPersonalAccessToken = async (
  data: z.infer<typeof createPersonalAccessTokenRequestSchema>
) => {
  return await apiServiceCall(
    "/user/personal-access-tokens",
    "post",
    data,
    createPersonalAccessTokenRequestSchema
  );
};

export const deletePersonalAccessToken = async (
  data: z.infer<typeof deletePersonalAccessTokenRequestSchema>
) => {
  return await apiServiceCall(
    `/user/personal-access-tokens/${data.id}`,
    "delete"
  );
};

export const getUser = async () => {
  return await apiServiceCall(
    "/api/user",
    "get",
    undefined,
    undefined,
    getUserResponseSchema
  );
};

export const checkEmail = async (
  data: z.infer<typeof checkEmailRequestSchema>
) => {
  return await apiServiceCall(`/email-exists/${data.email}`, "post");
};
