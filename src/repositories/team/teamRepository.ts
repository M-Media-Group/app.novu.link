import { z } from "zod";
import { apiServiceCall } from "../apiServiceCall";
import {
  createAnalyticsIntegrationRequestSchema,
  createTeamRequestSchema,
  deleteAnalyticsIntegrationRequestSchema,
  getAnalyticsIntegrationsResponseSchema,
  getSupportedAnalyticsIntegrationsResponseSchema,
  getUserTeamsResponseSchema,
  switchTeamRequestSchema,
  updateTeamRequestSchema,
} from "./teamSchema";

import $bus, { eventTypes } from "@/eventBus/events";

export const getUserTeams = async () => {
  return await apiServiceCall(
    `/api/v1/teams`,
    "get",
    undefined,
    undefined,
    getUserTeamsResponseSchema
  );
};

export const updateTeam = async (
  data: z.infer<typeof updateTeamRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/teams/${data.id}`,
    "put",
    data,
    updateTeamRequestSchema
  );
};

export const switchTeam = async (
  data: z.infer<typeof switchTeamRequestSchema>
) => {
  const response = await apiServiceCall(
    `/current-team`,
    "put",
    data,
    switchTeamRequestSchema
  );

  $bus.$emit(eventTypes.changed_team, data.team_id);

  return response;
};

export const createTeam = async (
  data: z.infer<typeof createTeamRequestSchema>
) => {
  const response = await apiServiceCall(
    `/teams`,
    "post",
    data,
    createTeamRequestSchema
  );

  $bus.$emit(eventTypes.created_team);

  return response;
};

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
