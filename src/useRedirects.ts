import axios from "axios";
import type { AxiosResponse } from "axios";
import type { Endpoint, Redirect } from "./types/redirect";
import $bus, { eventTypes } from "@/eventBus/events";
import i18n from "@/locales/i18n";

const baseUrl = import.meta.env.VITE_API_URL;

export const getRedirects = async () => {
  return (await axios.get("/api/v1/redirects")) as AxiosResponse<Redirect[]>;
};

export const getRedirect = async (redirectId: string) => {
  return (await axios.get(
    `/api/v1/redirects/${redirectId}`
  )) as AxiosResponse<Redirect>;
};

export const createRedirect = async (data: any) => {
  await axios.post("/api/v1/redirects", data);
};

export const updateRedirect = async (redirectId: string, data: any) => {
  return await axios
    .put(`/api/v1/redirects/${redirectId}`, data)
    .then((response) => {
      $bus.$emit(eventTypes.updated_redirect, redirectId);
      return response;
    });
};

export const deleteRedirect = async (redirectId: string) => {
  return await axios
    .delete(`/api/v1/redirects/${redirectId}`)
    .then((response) => {
      $bus.$emit(eventTypes.deleted_redirect, redirectId);
      return response;
    });
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
  return await axios.post(`/api/v1/redirects/${redirectId}/endpoints`, data);
};

export const updateRedirectEndpoint = async (
  redirectId: string,
  endpointId: string,
  data: Endpoint
) => {
  const results = await axios.put(
    `/api/v1/redirects/${redirectId}/endpoints/${endpointId}`,
    data
  );

  // If the results are successful, emit an event to let the app know that the endpoint was updated
  if (results.status === 200) {
    $bus.$emit(eventTypes.updated_endpoint, endpointId);
  }

  return results;
};

export const deleteRedirectEndpoint = async (
  redirectId: string,
  endpointId: string
) => {
  const results = await axios.delete(
    `/api/v1/redirects/${redirectId}/endpoints/${endpointId}`
  );

  // If the results are successful, emit an event to let the app know that the endpoint was deleted
  if (results.status === 200) {
    $bus.$emit(eventTypes.deleted_endpoint, endpointId);
  }

  return results;
};

export const startSubscription = async (redirectId: string) => {
  $bus.$emit(eventTypes.confirmed_willingness_to_start_subscription);

  const response = await axios.post(
    `/api/v1/redirects/${redirectId}/subscribe`
  );

  if (response.status === 200) {
    $bus.$emit(eventTypes.started_subscription);
    return Promise.resolve();
  } else {
    const t = i18n.global.t;
    console.error("Failed to start subscription", response);
    alert(
      t("An error occurred. Please try again.") +
        " " +
        t("Your subscription was not started and you have not been billed.")
    );
    return Promise.reject();
  }
};

export const unsubscribe = async (redirectId: string) => {
  const response = await axios.post(
    `/api/v1/redirects/${redirectId}/unsubscribe`
  );

  if (response.status === 200) {
    $bus.$emit(eventTypes.unsubscribed);
    return Promise.resolve(true);
  } else {
    const t = i18n.global.t;
    console.error("Failed to unsubscribe", response);
    alert(
      t("An error occurred. Please try again.") +
        " " +
        t("Your subscription was not canceled.")
    );
    return Promise.reject(response);
  }
};
