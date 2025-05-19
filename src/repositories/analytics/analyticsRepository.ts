import type { z } from "zod";
import { apiServiceCall } from "../apiServiceCall";
import {
  createAnalyticsIntegrationRequestSchema,
  deleteAnalyticsIntegrationRequestSchema,
  getAnalyticsIntegrationsResponseSchema,
  getSupportedAnalyticsIntegrationsResponseSchema,
  toggleRedirectAnalyticsIntegrationRequestSchema,
} from "./analyticsSchema";

import $bus, { eventTypes } from "@/eventBus/events";

export const getAnalyticsIntegrations = async () => {
  return await apiServiceCall(
    `/api/v1/analytics/integrations`,
    "get",
    undefined,
    undefined,
    getAnalyticsIntegrationsResponseSchema
  );
};

export const deleteAnalyticsIntegration = async (
  data: z.infer<typeof deleteAnalyticsIntegrationRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/analytics/integrations/${data.id}`,
    "delete",
    data,
    deleteAnalyticsIntegrationRequestSchema
  );
};

export const createAnalyticsIntegration = async (
  data: Partial<z.infer<typeof createAnalyticsIntegrationRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/analytics/integrations`,
    "post",
    data,
    createAnalyticsIntegrationRequestSchema
  );

  $bus.$emit(eventTypes.created_analytics_integration);

  return response;
};

export const getSupportedAnalyticsIntegrations = async () => {
  return await apiServiceCall(
    `/api/v1/analytics/integrations/supported`,
    "get",
    undefined,
    undefined,
    getSupportedAnalyticsIntegrationsResponseSchema
  );
};

export const deleteRedirectAnalyticsIntegration = async (
  data: z.infer<typeof toggleRedirectAnalyticsIntegrationRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.redirect_id}/analytics/integrations/${data.integration_id}`,
    "delete",
    data,
    toggleRedirectAnalyticsIntegrationRequestSchema
  );
};

export const createRedirectAnalyticsIntegration = async (
  data: Partial<z.infer<typeof toggleRedirectAnalyticsIntegrationRequestSchema>>
) => {
  return await apiServiceCall(
    `/api/v1/redirects/${data.redirect_id}/analytics/integrations`,
    "post",
    data,
    toggleRedirectAnalyticsIntegrationRequestSchema
  );
};
