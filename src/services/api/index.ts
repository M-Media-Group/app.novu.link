// src/services/api/index.ts

import { handleError } from "./apiServiceErrorHandler";
import type { HttpClient } from "./clients/genericHttpClient";

export function createApiService(client: HttpClient) {
  return {
    async get<T>(url: string, params?: object): Promise<T> {
      try {
        return await client.get<T>(url, { params });
      } catch (error) {
        handleError(error, `GET ${url}`);
        throw error;
      }
    },

    async post<T>(url: string, data?: any, config?: object): Promise<T> {
      try {
        return await client.post<T>(url, data, config);
      } catch (error) {
        handleError(error, `POST ${url}`);
        throw error;
      }
    },

    async put<T>(url: string, data?: any, config?: object): Promise<T> {
      try {
        return await client.put<T>(url, data, config);
      } catch (error) {
        handleError(error, `PUT ${url}`);
        throw error;
      }
    },

    async delete<T>(url: string, config?: object): Promise<T> {
      try {
        return await client.delete<T>(url, config);
      } catch (error) {
        handleError(error, `DELETE ${url}`);
        throw error;
      }
    },

    async fetchCsrfToken<T>(): Promise<T> {
      try {
        return await client.get<T>("/sanctum/csrf-cookie");
      } catch (error) {
        handleError(error, "fetching CSRF cookie");
        throw error;
      }
    },
  };
}
