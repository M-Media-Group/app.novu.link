import { z } from "zod";
import {
  addRedirectEndpointRequestSchema,
  createRedirectRequestSchema,
  createRedirectResponseSchema,
  generalEndpointRequestSchema,
  getRedirectRequestSchema,
  getRedirectResponseSchema,
  getRedirectsResponseSchema,
  startSubscriptionRequestSchema,
  updateRedirectEndpointRequestSchema,
  updateRedirectEndpointResponseSchema,
  updateRedirectRequestSchema,
} from "./redirectSchema";
import { apiServiceCall } from "../apiServiceCall";

import $bus, { eventTypes } from "@/eventBus/events";
import { baseUrl } from "@/services/apiClient";

export const createRedirect = async (
  /**
   * @NOTE we can enforce stronger types by not using partial here and removing  (? Partial<ReqType>) from teh apiServiceCall, but this would discourage developers from using the Zod validation, as they would be expected to pass nearly all valid data beforehand, and forcing them to implement their own validation
   */
  data: Partial<z.infer<typeof createRedirectRequestSchema>>
) => {
  const response = await apiServiceCall(
    "/redirects",
    "post",
    data,
    createRedirectRequestSchema,
    createRedirectResponseSchema
  );
  $bus.$emit(eventTypes.created_redirect);
  return response;
};

export const getRedirects = async () => {
  return await apiServiceCall(
    "/api/v1/redirects",
    "get",
    undefined,
    undefined,
    getRedirectsResponseSchema
  );
};

export const getRedirect = async (
  data: z.infer<typeof getRedirectRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}`,
    "get",
    undefined,
    undefined,
    getRedirectResponseSchema
  );
};

export const updateRedirect = async (
  data: z.infer<typeof updateRedirectRequestSchema>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.id}`,
    "put",
    data,
    updateRedirectRequestSchema
  );
  $bus.$emit(eventTypes.updated_redirect, data.id);
  return response;
};

export const deleteRedirect = async (
  data: z.infer<typeof getRedirectRequestSchema>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.id}`,
    "delete",
    undefined,
    undefined,
    undefined
  );
  $bus.$emit(eventTypes.deleted_redirect, data.id);
  return response;
};

export const addRedirectEndpoint = async (
  data: Partial<z.infer<typeof addRedirectEndpointRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.id}/endpoints`,
    "post",
    data,
    addRedirectEndpointRequestSchema,
    undefined
  );
  $bus.$emit(eventTypes.created_endpoint);
  return response;
};

export const updateRedirectEndpoint = async (
  data: Partial<z.infer<typeof updateRedirectEndpointRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.id}/endpoints/${data.endpoint_id}`,
    "put",
    data,
    updateRedirectEndpointRequestSchema,
    updateRedirectEndpointResponseSchema
  );
  $bus.$emit(eventTypes.updated_endpoint, data.endpoint_id);
  return response;
};

export const deleteRedirectEndpoint = async (
  data: z.infer<typeof generalEndpointRequestSchema>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.id}/endpoints/${data.endpoint_id}`,
    "delete",
    undefined,
    undefined,
    undefined
  );
  $bus.$emit(eventTypes.deleted_endpoint, data.endpoint_id);
  return response;
};

export const startSubscription = async (
  data: z.infer<typeof startSubscriptionRequestSchema>
) => {
  $bus.$emit(eventTypes.confirmed_willingness_to_start_subscription);

  const response = await apiServiceCall(
    `/api/v1/redirects/${data.id}/subscription`,
    "post",
    data,
    startSubscriptionRequestSchema,
    undefined
  );

  $bus.$emit(eventTypes.started_subscription);

  return response;
};

export const unsubscribe = async (
  data: z.infer<typeof startSubscriptionRequestSchema>
) => {
  const response = await apiServiceCall(
    `/api/v1/redirects/${data.id}/subscription`,
    "delete",
    undefined,
    undefined,
    undefined
  );
  $bus.$emit(eventTypes.unsubscribed);
  return response;
};

export const getRedirectUrl = async (redirectId: string) => {
  return `${baseUrl}/l/${redirectId}`;
};

export const getRedirectQrCodeDataUrl = (
  redirectId: string,
  designId?: string | number
) => {
  return `${getRedirectUrl(redirectId)}?nl_qr${
    designId ? `&nl_d=${designId}` : ""
  }`;
};
