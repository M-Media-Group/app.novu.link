import type { Endpoint } from "./types/redirect";
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
  return await updateRedirectRepo({
    id,
    ...data,
  });
};

export const deleteRedirect = async (id: string) => {
  return await deleteRedirectRepo({ id });
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
  return await updateRedirectEndpointRepo({
    ...data,
    id,
    endpoint_id: endpointId,
  });
};

export const deleteRedirectEndpoint = async (
  id: string,
  endpointId: number
) => {
  return await deleteRedirectEndpointRepo({
    id,
    endpoint_id: endpointId,
  });
};

export const startSubscription = async (id: string) => {
  await startSubscriptionRepo({ id });
};

export const unsubscribe = async (id: string) => {
  await unsubscribeRepo({ id });
  return Promise.resolve(true);
};
