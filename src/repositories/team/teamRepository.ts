import { apiServiceCall } from "../apiServiceCall";
import { getUserTeamsResponseSchema } from "./teamSchema";

export const getUserTeams = async () => {
  return await apiServiceCall(
    `/api/v1/teams`,
    "get",
    undefined,
    undefined,
    getUserTeamsResponseSchema
  );
};
