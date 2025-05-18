import type { Endpoint } from "./types/redirect";
import $bus, { eventTypes } from "@/eventBus/events";
import i18n from "@/locales/i18n";
import { apiService } from "./services/apiClient";

const baseUrl = import.meta.env.VITE_API_URL;
const t = i18n.global.t;

export const updateRedirect = async (redirectId: string, data: any) => {
  return await apiService
    .put(`/api/v1/redirects/${redirectId}`, data)
    .then((response) => {
      $bus.$emit(eventTypes.updated_redirect, redirectId);
      return response;
    });
};

export const deleteRedirect = async (redirectId: string) => {
  const response = await apiService.delete(`/api/v1/redirects/${redirectId}`);
  $bus.$emit(eventTypes.deleted_redirect, redirectId);
  return response;
};

export const getRedirectQrCodeUrl = (redirectId: string) => {
  return `${baseUrl}/api/v1/redirects/${redirectId}/qr`;
};

export const getRedirectQrCodeDataUrl = (
  redirectId: string,
  designId?: string | number
) => {
  return `${baseUrl}/l/${redirectId}?nl_qr${
    designId ? `&nl_d=${designId}` : ""
  }`;
};

export const getRedirectUrl = (redirectId: string) => {
  return `${baseUrl}/l/${redirectId}`;
};

export const addRedirectEndpoint = async (
  redirectId: string,
  data: Endpoint
) => {
  return await apiService.post(
    `/api/v1/redirects/${redirectId}/endpoints`,
    data
  );
};

export const updateRedirectEndpoint = async (
  redirectId: string,
  endpointId: string,
  data: Endpoint
) => {
  const respone = await apiService.put(
    `/api/v1/redirects/${redirectId}/endpoints/${endpointId}`,
    data
  );
  $bus.$emit(eventTypes.updated_endpoint, endpointId);
  return respone;
};

export const deleteRedirectEndpoint = async (
  redirectId: string,
  endpointId: string
) => {
  const respone = await apiService.delete(
    `/api/v1/redirects/${redirectId}/endpoints/${endpointId}`
  );
  $bus.$emit(eventTypes.deleted_endpoint, endpointId);
  return respone;
};

export const startSubscription = async (redirectId: string) => {
  try {
    $bus.$emit(eventTypes.confirmed_willingness_to_start_subscription);

    await apiService.post(`/api/v1/redirects/${redirectId}/subscription`);

    $bus.$emit(eventTypes.started_subscription);
    return Promise.resolve();
  } catch (error) {
    console.error("Failed to start subscription", error);
    alert(
      t("An error occurred. Please try again.") +
        " " +
        t("Your subscription was not started and you have not been billed.")
    );
    return Promise.reject();
  }
};

export const unsubscribe = async (redirectId: string) => {
  try {
    await apiService.delete(`/api/v1/redirects/${redirectId}/subscription`);
    $bus.$emit(eventTypes.unsubscribed);
    return Promise.resolve(true);
  } catch (error) {
    const t = i18n.global.t;
    console.error("Failed to unsubscribe", error);
    alert(
      t("An error occurred. Please try again.") +
        " " +
        t("Your subscription was not canceled.")
    );
    return Promise.reject(error);
  }
};
