import { z } from "zod";
import { apiServiceCall } from "../apiServiceCall";
import {
  createTeamRequestSchema,
  getUserTeamsResponseSchema,
  switchTeamRequestSchema,
  updateTeamRequestSchema,
} from "./teamSchema";

import $bus from "@/eventBus/events";

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

  $bus.$emit("updated_team", data.id);
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

  $bus.$emit("changed_team", data.team_id);

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

  $bus.$emit("created_team");

  return response;
};
