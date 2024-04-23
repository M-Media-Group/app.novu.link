import axios from "axios";
import type { AxiosResponse } from "axios";
import type { Endpoint, Redirect } from "./types/redirect";

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
  return (await axios.put(
    `/api/v1/redirects/${redirectId}`,
    data
  )) as AxiosResponse<void>;
};

export const deleteRedirect = async (redirectId: string) => {
  await axios.delete(`/api/v1/redirects/${redirectId}`);
};

export const getRedirectQrCodeUrl = (redirectId: string) => {
  return `${baseUrl}api/v1/redirects/${redirectId}/qr`;
};

export const getRedirectQrCodeDataUrl = (redirectId: string) => {
  return `${baseUrl}l/${redirectId}?utm_medium=novu_link_qr_code`;
};

export const getRedirectUrl = (redirectId: string) => {
  return `${baseUrl}l/${redirectId}`;
};

export const addRedirectEndpoint = async (
  redirectId: string,
  data: Endpoint
) => {
  return await axios.post(`/api/v1/redirects/${redirectId}/endpoints`, data);
};
