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
  const respone = await apiServiceCall(
    "/user/otp",
    "post",
    data,
    requestOtpRequestSchema
  );
  $bus.$emit(eventTypes.sent_otp);
  return respone;
};

export const confirmOtp = async (
  data: z.infer<typeof confirmOtpRequestSchema>
) => {
  const response = await apiServiceCall(
    "/user/otp/confirm",
    "post",
    data,
    confirmOtpRequestSchema,
    z.object({
      user_created: z.boolean(),
    })
  );
  $bus.$emit(eventTypes.confirmed_otp);
  if (response.user_created) {
    $bus.$emit(eventTypes.registered);
  } else {
    $bus.$emit(eventTypes.logged_in);
  }
  return response;
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
  const response = await apiServiceCall(
    "/forgot-password",
    "post",
    data,
    sendPasswordResetEmailRequestSchema
  );
  $bus.$emit(eventTypes.sent_reset_password_email);
  return response;
};

export const sendPasswordReset = async (
  data: z.infer<typeof sendPasswordResetRequestSchema>
) => {
  const response = await apiServiceCall(
    "/reset-password",
    "post",
    data,
    sendPasswordResetRequestSchema
  );
  $bus.$emit(eventTypes.reset_password);
  return response;
};

export const confirmPassword = async (
  data: z.infer<typeof confirmPasswordRequestSchema>
) => {
  const response = await apiServiceCall(
    "/user/confirm-password",
    "post",
    data,
    sendPasswordResetRequestSchema
  );
  $bus.$emit(eventTypes.confirmed_password);
  return response;
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
  const response = await apiServiceCall("/logout", "post");
  $bus.$emit(eventTypes.logged_out);
  return response;
};

export const update = async (data: z.infer<typeof updateRequestSchema>) => {
  const response = await apiServiceCall(
    "/user/profile-information",
    "put",
    data,
    updateRequestSchema
  );
  $bus.$emit(eventTypes.updated_user);
  return response;
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
  const response = await apiServiceCall(
    "/user/personal-access-tokens",
    "post",
    data,
    createPersonalAccessTokenRequestSchema
  );
  $bus.$emit(eventTypes.created_personal_access_token);
  return response;
};

export const deletePersonalAccessToken = async (
  data: z.infer<typeof deletePersonalAccessTokenRequestSchema>
) => {
  const response = await apiServiceCall(
    `/user/personal-access-tokens/${data.id}`,
    "delete"
  );
  $bus.$emit(eventTypes.deleted_personal_access_token);
  return response;
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
