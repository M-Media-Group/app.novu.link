import { z } from "zod";
import { apiServiceCall } from "../apiServiceCall";
import {
  createTeamRequestSchema,
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
