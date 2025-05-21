import { z } from "zod";

import {
  createTeamRequestSchema,
  getUserTeamsResponseSchema,
  switchTeamRequestSchema,
  updateTeamRequestSchema,
} from "./teamSchema.js";


import { apiServiceCall } from "./../../services/apiServiceCall.js";

import { getEventBus } from "./../../services/apiClient.js";

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
  const response = await apiServiceCall(
    `/teams/${data.id}`,
    "put",
    data,
    updateTeamRequestSchema
  );

  getEventBus()?.$emit("updated_team", data.id);
  return response;
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

  getEventBus()?.$emit("changed_team", data.team_id);

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

  getEventBus()?.$emit("created_team");

  return response;
};
