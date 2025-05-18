import type { Endpoint } from "./types/redirect";
import $bus, { eventTypes } from "@/eventBus/events";
import {
  addRedirectEndpoint as addRedirectEndpointRepo,
  deleteRedirectEndpoint as deleteRedirectEndpointRepo,
  deleteRedirect as deleteRedirectRepo,
  startSubscription as startSubscriptionRepo,
  unsubscribe as unsubscribeRepo,
  updateRedirectEndpoint as updateRedirectEndpointRepo,
  updateRedirect as updateRedirectRepo,
} from "./repositories/redirect/redirectRepository";

const baseUrl = import.meta.env.VITE_API_URL;

export const updateRedirect = async (id: string, data: any) => {
  const response = await updateRedirectRepo({
    id,
    ...data,
  });
  $bus.$emit(eventTypes.updated_redirect, id);
  return response;
};

export const deleteRedirect = async (id: string) => {
  const response = await deleteRedirectRepo({ id });
  $bus.$emit(eventTypes.deleted_redirect, id);
  return response;
};

export const getRedirectQrCodeUrl = (redirectId: string) => {
  return `${baseUrl}/api/v1/redirects/${redirectId}/qr`;
};

export const getRedirectQrCodeDataUrl = (
  redirectId: string,
  designId?: string | number
) => {
  return `${getRedirectUrl(redirectId)}?nl_qr${
    designId ? `&nl_d=${designId}` : ""
  }`;
};

export const getRedirectUrl = (redirectId: string) => {
  return `${baseUrl}/l/${redirectId}`;
};

export const addRedirectEndpoint = async (
  id: string,
  data: Parameters<typeof addRedirectEndpointRepo>[0]
) => {
  return await addRedirectEndpointRepo({ ...data, id });
};

export const updateRedirectEndpoint = async (
  id: string,
  endpointId: number,
  data: Endpoint
) => {
  const respone = await updateRedirectEndpointRepo({
    ...data,
    id,
    endpoint_id: endpointId,
  });
  $bus.$emit(eventTypes.updated_endpoint, endpointId);
  return respone;
};

export const deleteRedirectEndpoint = async (
  id: string,
  endpointId: number
) => {
  const respone = await deleteRedirectEndpointRepo({
    id,
    endpoint_id: endpointId,
  });
  $bus.$emit(eventTypes.deleted_endpoint, endpointId);
  return respone;
};

export const startSubscription = async (id: string) => {
  $bus.$emit(eventTypes.confirmed_willingness_to_start_subscription);
  await startSubscriptionRepo({ id });
  $bus.$emit(eventTypes.started_subscription);
};

export const unsubscribe = async (id: string) => {
  await unsubscribeRepo({ id });
  $bus.$emit(eventTypes.unsubscribed);
  return Promise.resolve(true);
};
