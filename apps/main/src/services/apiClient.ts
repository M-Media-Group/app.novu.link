// src/services/apiService.ts

import { createApiService } from "./api";
import apiClient from "./api/clients/axios";

export const baseUrl = import.meta.env.VITE_API_URL;
/**
 * Fetches the CSRF cookie from the server.
 * Typically required by Laravel Sanctum before making state-changing requests.
 */

const apiService = createApiService(apiClient);

export default apiService;
