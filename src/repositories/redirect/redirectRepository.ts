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

export const createRedirect = async (
  /**
   * @NOTE we can enforce stronger types by not using partial here and removing  (? Partial<ReqType>) from teh apiServiceCall, but this would discourage developers from using the Zod validation, as they would be expected to pass nearly all valid data beforehand, and forcing them to implement their own validation
   */
  data: Partial<z.infer<typeof createRedirectRequestSchema>>
) => {
  return await apiServiceCall(
    "/redirects",
    "post",
    data,
    createRedirectRequestSchema,
    createRedirectResponseSchema
  );
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
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}`,
    "put",
    data,
    updateRedirectRequestSchema
  );
};

export const deleteRedirect = async (
  data: z.infer<typeof getRedirectRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}`,
    "delete",
    undefined,
    undefined,
    undefined
  );
};

export const addRedirectEndpoint = async (
  data: Partial<z.infer<typeof addRedirectEndpointRequestSchema>>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}/endpoints`,
    "post",
    data,
    addRedirectEndpointRequestSchema,
    undefined
  );
};

export const updateRedirectEndpoint = async (
  data: z.infer<typeof updateRedirectEndpointRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}/endpoints/${data.endpoint_id}`,
    "put",
    data,
    updateRedirectEndpointRequestSchema,
    updateRedirectEndpointResponseSchema
  );
};

export const deleteRedirectEndpoint = async (
  data: z.infer<typeof generalEndpointRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}/endpoints/${data.endpoint_id}`,
    "delete",
    undefined,
    undefined,
    undefined
  );
};

export const startSubscription = async (
  data: z.infer<typeof startSubscriptionRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}/subscription`,
    "post",
    data,
    startSubscriptionRequestSchema,
    undefined
  );
};

export const unsubscribe = async (
  data: z.infer<typeof startSubscriptionRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.id}/subscription`,
    "delete",
    undefined,
    undefined,
    undefined
  );
};
